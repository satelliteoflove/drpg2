import {
  BanterGenerator as IBanterGenerator,
  BanterResponse,
  BanterLine,
  MinimalContext,
  StandardContext,
  RichContext
} from '../../types/BanterTypes';
import { PromptBuilder } from './PromptBuilder';
import { BanterMetrics } from './BanterMetrics';
import { GAME_CONFIG } from '../../config/GameConstants';
import { DebugLogger } from '../../utils/DebugLogger';

export class BanterGenerator implements IBanterGenerator {
  constructor(private metrics: BanterMetrics) {
    DebugLogger.info('BanterGenerator', 'BanterGenerator service initialized', {
      endpoint: GAME_CONFIG.BANTER.LLM.ENDPOINT,
      model: GAME_CONFIG.BANTER.LLM.MODEL,
      timeout: GAME_CONFIG.BANTER.LLM.TIMEOUT_MS
    });
  }

  async generate(context: MinimalContext | StandardContext | RichContext): Promise<BanterResponse> {
    const startTime = Date.now();

    try {
      const builtPrompt = PromptBuilder.buildPrompt(context);

      DebugLogger.info('BanterGenerator', 'Starting generation', {
        triggerType: builtPrompt.metadata.triggerType,
        exchangeType: builtPrompt.metadata.exchangeType,
        speaker: builtPrompt.metadata.speaker,
        estimatedTokens: builtPrompt.metadata.estimatedTokens
      });

      const response = await this.callLLMAPI(builtPrompt.systemPrompt, builtPrompt.userPrompt);
      const parsedResponse = this.parseResponse(response, context);

      const elapsedTime = Date.now() - startTime;
      this.metrics.recordGeneration(elapsedTime, true);

      DebugLogger.info('BanterGenerator', 'Generation successful', {
        triggerType: context.trigger.type,
        speaker: context.speaker.name,
        exchangeType: parsedResponse.exchangeType,
        lineCount: parsedResponse.lines.length,
        participants: parsedResponse.participants,
        timeMs: elapsedTime
      });

      return parsedResponse;

    } catch (error: any) {
      const elapsedTime = Date.now() - startTime;
      this.metrics.recordGeneration(elapsedTime, false);
      this.metrics.recordApiFailure();

      DebugLogger.error('BanterGenerator', 'Generation failed', {
        error: error.message,
        trigger: context.trigger.type,
        speaker: context.speaker.name,
        timeMs: elapsedTime
      });

      throw error;
    }
  }

  private async callLLMAPI(systemPrompt: string, userPrompt: string): Promise<string> {
    const config = GAME_CONFIG.BANTER.LLM;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.TIMEOUT_MS);

    try {
      const response = await fetch(config.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: config.TEMPERATURE,
          max_tokens: config.MAX_OUTPUT_TOKENS,
          repetition_penalty: config.REPETITION_PENALTY,
          min_p: config.MIN_P
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.choices && data.choices.length > 0 && data.choices[0].text) {
        return data.choices[0].text;
      }

      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        return data.choices[0].message.content;
      }

      throw new Error('Invalid API response format: no text or message.content found');

    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(`LLM API timeout after ${config.TIMEOUT_MS}ms`);
      }

      if (error.message.includes('fetch')) {
        throw new Error('LLM API unavailable - is oobabooga running?');
      }

      throw error;
    }
  }

  private parseResponse(text: string, context: MinimalContext | StandardContext | RichContext): BanterResponse {
    const lines = text.trim().split('\n').filter(line => line.trim().length > 0);

    const banterLines: BanterLine[] = [];
    const participants: Set<string> = new Set();

    for (const line of lines) {
      let characterName: string;
      let dialogueText: string;

      const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
      if (colonMatch) {
        characterName = colonMatch[1].trim();
        dialogueText = colonMatch[2].trim().replace(/^["']|["']$/g, '');
      } else {
        characterName = context.speaker.name;
        dialogueText = line.trim().replace(/^["']|["']$/g, '');
      }

      if (dialogueText.length > 0) {
        banterLines.push({
          characterName,
          text: dialogueText
        });

        participants.add(characterName);
      } else {
        DebugLogger.warn('BanterGenerator', 'Skipping empty dialogue line', {
          line,
          speaker: context.speaker.name
        });
      }
    }

    if (banterLines.length === 0) {
      throw new Error('No valid dialogue lines found in response');
    }

    const exchangeType = this.determineExchangeType(participants);

    return {
      exchangeType,
      participants: Array.from(participants),
      lines: banterLines,
      generatedAt: Date.now()
    };
  }

  private determineExchangeType(participants: Set<string>): 'solo' | 'two_person' | 'group' {
    const participantCount = participants.size;

    if (participantCount === 1) {
      return 'solo';
    } else if (participantCount === 2) {
      return 'two_person';
    } else {
      return 'group';
    }
  }
}

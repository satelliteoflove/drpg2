import { BanterPresenter as IBanterPresenter, BanterResponse } from '../../types/BanterTypes';
import { MessageLog } from '../../ui/MessageLog';
import { Party } from '../../entities/Party';
import { DebugLogger } from '../../utils/DebugLogger';

export class BanterPresenter implements IBanterPresenter {
  public display(response: BanterResponse, messageLog: MessageLog, party: Party): void {
    messageLog.addBanterExchange(response, party);

    DebugLogger.info('BanterPresenter', 'Banter displayed in message log', {
      exchangeType: response.exchangeType,
      participants: response.participants,
      lineCount: response.lines.length,
      generatedAt: response.generatedAt,
      lines: response.lines
    });
  }

  public displayErrorMessage(messageLog: MessageLog): void {
    messageLog.addMessage('Banter system failure.', '#ff6666');

    DebugLogger.warn('BanterPresenter', 'Error message displayed to player');
  }
}

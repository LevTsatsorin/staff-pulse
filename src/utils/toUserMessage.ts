import { ApiError } from 'src/errors/ApiError';
import { ApiValidationError } from 'src/errors/ApiValidationError';
import { OrgDataError, type OrgDataErrorCode } from 'src/errors/OrgDataError';

const ORG_DATA_MESSAGES: Record<OrgDataErrorCode, string> = {
  'duplicate-id': 'повторяется идентификатор подразделения',
  orphan: 'подразделение ссылается на несуществующего родителя',
  cycle: 'в структуре обнаружен цикл',
};

export const toUserMessage = (error: unknown): string => {
  if (error instanceof ApiValidationError) return 'Сервер вернул данные в неожиданном формате';
  if (error instanceof OrgDataError) {
    return `Данные повреждены: ${ORG_DATA_MESSAGES[error.code]} (${error.nodeId})`;
  }
  if (error instanceof ApiError) {
    return error.status >= 500 ? 'Сервер временно недоступен' : `Ошибка запроса (${error.status})`;
  }
  if (error instanceof TypeError) return 'Нет соединения с сервером';
  return 'Что-то пошло не так';
};

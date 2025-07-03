import {ResponseData , Response} from "../../types/interfaces/schema/interfaces.schema";

function createResponse(success: boolean, message: string = '', data: ResponseData = {}): Response {
  return {
    success,
    message,
    data
  };
}

export { createResponse };

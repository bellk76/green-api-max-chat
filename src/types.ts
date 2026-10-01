export interface Credentials {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export interface ChatMessage {
  id: string
  chatId: string
  text: string
  outgoing: boolean
  timestamp: number
}

export interface NotificationBody {
  typeWebhook?: string
  senderData?: {
    chatId?: string
    sender?: string
    senderName?: string
  }
  messageData?: {
    typeMessage?: string
    textMessageData?: {
      textMessage?: string
    }
  }
  idMessage?: string
  timestamp?: number
}

export interface IncomingNotification {
  receiptId: number
  body: NotificationBody
}

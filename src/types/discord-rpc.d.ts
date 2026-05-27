declare module 'discord-rpc' {
  export class Client {
    constructor(options: { transport: string })
    login(options: { clientId: string }): Promise<void>
    setActivity(presence: Presence): Promise<void>
    clearActivity(): Promise<void>
    user?: any
    on(event: string, callback: (...args: any[]) => void): void
  }

  export interface Presence {
    details?: string
    state?: string
    startTimestamp?: number
    endTimestamp?: number
    largeImageKey?: string
    largeImageText?: string
    smallImageKey?: string
    smallImageText?: string
    instance?: boolean
    buttons?: Array<{ label: string; url: string }>
  }
}

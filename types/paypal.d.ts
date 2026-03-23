// types/paypal.d.ts
declare module '@paypal/checkout-server-sdk' {
  export namespace core {
    class PayPalHttpClient {
      constructor(environment: SandboxEnvironment | LiveEnvironment)
      execute<T>(request: any): Promise<T>
    }
    
    class SandboxEnvironment {
      constructor(clientId: string, clientSecret: string)
    }
    
    class LiveEnvironment {
      constructor(clientId: string, clientSecret: string)
    }
  }
  
  export namespace orders {
    class OrdersCreateRequest {
      requestBody(body: any): void
    }
    
    class OrdersCaptureRequest {
      requestBody(body: any): void
      constructor(orderId: string)
    }
  }
}
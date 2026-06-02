declare module "@aws-sdk/client-secrets-manager" {
  export class SecretsManagerClient {
    constructor(config: { region: string });
    send(command: GetSecretValueCommand): Promise<{ SecretString?: string }>;
  }
  export class GetSecretValueCommand {
    constructor(input: { SecretId: string });
  }
}

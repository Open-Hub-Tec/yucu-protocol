/**
 * Yucu Core - Stellar Raven MCP Bridge & Assistant Context Layer
 * 
 * Configura la integración con Stellar Raven (https://raven.stellar.buzz/mcp),
 * el servidor de Model Context Protocol (MCP) de Stellar Raven (comunidad).
 */

export interface StellarRavenConfig {
  endpoint: string;
  playgroundUrl: string;
  tools: Array<{
    name: string;
    description: string;
  }>;
}

export const STELLAR_RAVEN_DEFAULT_CONFIG: StellarRavenConfig = {
  endpoint: 'https://raven.stellar.buzz/mcp',
  playgroundUrl: 'https://raven.stellar.buzz/playground',
  tools: [
    {
      name: 'search',
      description: 'Búsqueda semántica en tiempo real sobre documentación oficial de Stellar, Soroban SDK y SEPs.'
    },
    {
      name: 'execute',
      description: 'Ejecución y consulta segura en sandbox sobre datos de red en vivo de Stellar y Soroban RPC.'
    }
  ]
};

export class StellarRavenBridge {
  public static getConfig(): StellarRavenConfig {
    return STELLAR_RAVEN_DEFAULT_CONFIG;
  }

  public static getInstallationSnippets(): {
    claudeCode: string;
    cursorMcpJson: string;
    description: string;
  } {
    return {
      claudeCode: 'claude mcp add --transport http stellar-raven "https://raven.stellar.buzz/mcp"',
      cursorMcpJson: JSON.stringify({
        mcpServers: {
          'stellar-raven': {
            type: 'http',
            url: 'https://raven.stellar.buzz/mcp'
          }
        }
      }, null, 2),
      description: 'Stellar Raven provee contexto técnico en tiempo real para desarrollo en Soroban Rust y @stellar/stellar-sdk sin alucinaciones.'
    };
  }
}

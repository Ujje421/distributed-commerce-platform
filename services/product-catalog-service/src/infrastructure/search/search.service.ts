import { Injectable, Inject, Logger } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { OPENSEARCH_CLIENT } from './opensearch.module';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly INDEX_NAME = 'products';

  constructor(@Inject(OPENSEARCH_CLIENT) private readonly client: Client) {}

  async createIndex() {
    try {
      const { body: indexExists } = await this.client.indices.exists({ index: this.INDEX_NAME });
      
      if (!indexExists) {
        await this.client.indices.create({
          index: this.INDEX_NAME,
          body: {
            settings: {
              analysis: {
                analyzer: {
                  edge_ngram_analyzer: {
                    tokenizer: 'edge_ngram_tokenizer',
                    filter: ['lowercase'],
                  },
                },
                tokenizer: {
                  edge_ngram_tokenizer: {
                    type: 'edge_ngram',
                    min_gram: 2,
                    max_gram: 20,
                    token_chars: ['letter', 'digit'],
                  },
                },
              },
            },
            mappings: {
              properties: {
                id: { type: 'keyword' },
                name: { 
                  type: 'text',
                  analyzer: 'edge_ngram_analyzer',
                  search_analyzer: 'standard',
                },
                description: { type: 'text' },
                price: { type: 'double' },
                brand: { type: 'keyword' },
                categoryId: { type: 'keyword' },
                categoryName: { type: 'keyword' },
                status: { type: 'keyword' },
              },
            },
          },
        });
        this.logger.log(`Created OpenSearch index: ${this.INDEX_NAME}`);
      }
    } catch (error) {
      this.logger.error(`Failed to create index: ${(error as Error).message}`, (error as Error).stack);
    }
  }

  async indexProduct(product: any) {
    try {
      await this.client.index({
        index: this.INDEX_NAME,
        id: product.id,
        body: product,
        refresh: true, // Force refresh for immediate searchability (fine for low volume updates)
      });
    } catch (error) {
      this.logger.error(`Failed to index product ${product.id}: ${(error as Error).message}`, (error as Error).stack);
    }
  }

  async removeProduct(id: string) {
    try {
      await this.client.delete({
        index: this.INDEX_NAME,
        id,
        refresh: true,
      });
    } catch (error) {
      // Ignore 404s
      if ((error as any).meta?.statusCode !== 404) {
        this.logger.error(`Failed to delete product ${id} from index: ${(error as Error).message}`, (error as Error).stack);
      }
    }
  }

  async search(query: string, categoryId?: string, minPrice?: number, maxPrice?: number) {
    const must: any[] = [];
    
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['name^3', 'description', 'brand'], // Boost name field
          fuzziness: 'AUTO',
        },
      });
    } else {
      must.push({ match_all: {} });
    }

    const filter: any[] = [];
    if (categoryId) {
      filter.push({ term: { categoryId } });
    }
    
    // Status must be ACTIVE
    filter.push({ term: { status: 'ACTIVE' } });

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceRange: any = {};
      if (minPrice !== undefined) priceRange.gte = minPrice;
      if (maxPrice !== undefined) priceRange.lte = maxPrice;
      filter.push({ range: { price: priceRange } });
    }

    try {
      const { body } = await this.client.search({
        index: this.INDEX_NAME,
        body: {
          query: {
            bool: {
              must,
              filter,
            },
          },
        },
      });

      return {
        total: body.hits.total.value,
        items: body.hits.hits.map((hit: any) => hit._source),
      };
    } catch (error) {
      this.logger.error(`Search query failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async autocomplete(query: string) {
    if (!query || query.length < 2) return [];

    try {
      const { body } = await this.client.search({
        index: this.INDEX_NAME,
        body: {
          query: {
            match: {
              name: {
                query,
                analyzer: 'standard', // Search against the edge-ngram indexed field using standard analyzer
              },
            },
          },
          size: 5,
        },
      });

      return body.hits.hits.map((hit: any) => ({
        id: hit._source.id,
        name: hit._source.name,
      }));
    } catch (error) {
      this.logger.error(`Autocomplete query failed: ${(error as Error).message}`, (error as Error).stack);
      return [];
    }
  }
}

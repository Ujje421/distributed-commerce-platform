import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';
import { SearchService } from './search.service';

export const OPENSEARCH_CLIENT = 'OPENSEARCH_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: OPENSEARCH_CLIENT,
      useFactory: (configService: ConfigService) => {
        const node = configService.get<string>('OPENSEARCH_NODE', 'http://localhost:9200');
        return new Client({
          node,
          // Depending on setup (e.g. AWS OpenSearch, basic auth), you might configure auth here.
        });
      },
      inject: [ConfigService],
    },
    SearchService,
  ],
  exports: [OPENSEARCH_CLIENT, SearchService],
})
export class OpenSearchModule {}

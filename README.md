# DynamoDB Query Builder

```javascript
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { QueryCommand } = require('@aws-sdk/lib-dynamodb')

const qb = new QueryBuilder()
const input = qb
  .table('music')
  .where({ status: 'foobar' })
  .build()

const client = new DynamoDBClient({ region: 'ap-northeast-1' })
await client.send(new QueryCommand(input))
```

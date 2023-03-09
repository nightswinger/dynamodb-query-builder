import { QueryInput } from '@aws-sdk/client-dynamodb'

export default class QueryBuilder {
  private tableName?: string
  private expressionAttributeNames: any = {}
  private expressionAttributeValues: any = {}
  private indexName?: string
  private keyConditionExpression: string = ''
  private filterExpression?: string
  private limitValue: number = 0
  private scanIndexForwardValue: boolean = true

  build() {
    const result: QueryInput = {
      TableName: this.tableName,
      ExpressionAttributeNames: this.expressionAttributeNames,
      ExpressionAttributeValues: this.expressionAttributeValues,
      KeyConditionExpression: this.keyConditionExpression,
      ScanIndexForward: this.scanIndexForwardValue
    }
    if (this.filterExpression) result.FilterExpression = this.filterExpression
    if (this.indexName) result.IndexName = this.indexName
    if (this.limitValue > 0) result.Limit = this.limitValue

    return result
  }

  table(name: string) {
    this.tableName = name
    return this
  }

  where(params: {[key: string]: any}) {
    const attrs = Object.entries(params)
    const [key, value] = attrs[0]

    const [name, operator] = key.split('.')

    const attributeName = this.setAttributeName(name)
    const attributeValue = this.setAttributeValue(value)

    this.setKeyConditionExpression(attributeName, attributeValue, operator)

    return this
  }

  filter(params: {[key: string]: any}) {
    const attrs = Object.entries(params)
    const [key, value] = attrs[0]

    const [name, operator] = key.split('.')

    const attributeName = this.setAttributeName(name)
    const attributeValue = this.setAttributeValue(value)

    this.setFilterExpression(attributeName, attributeValue, operator)

    return this
  }

  index(name: string) {
    this.indexName = name
    return this
  }

  limit(value: number) {
    this.limitValue = value
  }

  scanIndexForward(value: boolean) {
    if (typeof value === 'boolean') this.scanIndexForwardValue = value
    return this
  }

  private setAttributeName(attributeName = '') {
    const key = `#${attributeName}`
    this.expressionAttributeNames[key] = attributeName
    return key
  }

  private setAttributeValue(value: any) {
    const count = this.expressionAttributeValues ?
      Object.entries(this.expressionAttributeValues).length + 1 : 1
    const key = `:val${count}`
    this.expressionAttributeValues[key] = value
    return key
  }

  private setKeyConditionExpression(attrName: string, attrValue: string, operator = '=') {
    let keyConditionExp
    switch (operator) {
      case 'begins_with':
        keyConditionExp = `${operator}(${attrName}, ${attrValue})`
        break
      default:
        keyConditionExp = `${attrName} ${operator} ${attrValue}`
        break
    }
    if (this.keyConditionExpression.length > 0) keyConditionExp = `AND ${keyConditionExp}`

    this.keyConditionExpression = (`${this.keyConditionExpression} ${keyConditionExp}`).trim()
    return this.keyConditionExpression
  }

  private setFilterExpression(attrName: string, attrValue: string, operator = '=') {
    let filterExp
    switch (operator) {
      case 'ne':
        filterExp = `${attrName} <> ${attrValue}`
        break
      default:
        filterExp = `${attrName} ${operator} ${attrValue}`
        break
    }
    this.filterExpression = filterExp
    return this.filterExpression
  }
}

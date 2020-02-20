import * as cdk from '@aws-cdk/core'
// ここに使用するライブラリを追記する
import * as lambda from '@aws-cdk/aws-lambda'
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as iam from '@aws-cdk/aws-iam'

export class CdkTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // ここに生成するリソースを定義する
    cdk.Tag.add(this, 'use-case', 'workshop')

    const tableName = 'cdk-test-table'

    // Lambdaの定義
    const cdkTestFunction = new lambda.Function(this, 'cdk-test-function', {
      // 必須の項目
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.asset('lambda'),
      // オプション項目
      functionName: 'cdk-test-function',
      environment:{
        'TABLE_NAME': tableName
      }
    })

    // API Gatewayの定義
    const cdkTestApi = new apigateway.RestApi(this, 'cdk-test-api', {
      // オプション項目
      restApiName: 'cdk-test-api',
      deployOptions: {
        stageName: 'test'
      }
    })

    // API gateway→Lambdaの接続定義
    const integration = new apigateway.LambdaIntegration(cdkTestFunction)
    cdkTestApi.root.addMethod('POST', integration)

    // DynamoDBの定義
    const cdkTestTable = new dynamodb.Table(this, 'cdk-test-table', {
      // 必須の項目
      partitionKey: { name: 'user_id', type: dynamodb.AttributeType.NUMBER },
      // オプション項目
      sortKey: { name: 'created_at', type: dynamodb.AttributeType.STRING },
      tableName: tableName
    })

    //Lambda→DynamoDBのアクセスポリシーの定義
    cdkTestFunction.addToRolePolicy(new iam.PolicyStatement({
      resources: [cdkTestTable.tableArn],
      actions: [
        'dynamodb:PutItem'
      ]
    }
    ))
  }
}

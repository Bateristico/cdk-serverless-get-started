import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as apigateway from '@aws-cdk/aws-apigateway';

export class CdkServerlessGetStartedStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  
    // dynamodb table definition
    const table = new dynamodb.Table(this, 'TestTable', {
      partitionKey: { name: "name", type: dynamodb.AttributeType.STRING},
    });  

    // lambda function
    const dynamoLambda = new lambda.Function(this, "DynamoLambdaHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("functions"),
      handler: "function.handler",
      environment: {
        HELLO_TABLE_NAME: table.tableName
      },
    })

    // permission to the lamda to dynamo table
    table.grantReadWriteData(dynamoLambda);

    // create the API gateway with one method and path
    const api = new apigateway.RestApi(this, "device-token-api");

    // api key logic
    const apiKeyName = "auth-api-key"
    const apiKey = new apigateway.ApiKey(this, `auth-api-key-id`, {
                apiKeyName,
                description: `APIKey used by my api to do awesome stuff`,
                value: "THISISTHESECRETVALUE123!!",
                enabled: true,
            })

    const usagePlanProps: apigateway.UsagePlanProps = {
      name: "MyUsagePlan",
      apiKey,
    }           

    api.root.resourceForPath("device-token-endpoint").addMethod("GET", new apigateway.LambdaIntegration(dynamoLambda));
    api.addUsagePlan("MyUsagePlan", usagePlanProps)
  
  
  }



}

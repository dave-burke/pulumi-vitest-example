import * as aws from '@pulumi/aws'
import * as apigateway from '@pulumi/aws-apigateway'
import handler from './handler'

const table = new aws.dynamodb.Table('Table', {
  attributes: [
    {
      name: 'PK',
      type: 'S',
    },
  ],
  hashKey: 'PK',
  billingMode: 'PAY_PER_REQUEST',
})

const tableAccessPolicy = new aws.iam.Policy('DbAccessPolicy', {
  policy: table.arn.apply((tableArn) => JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'ListAndDescribe',
        Effect: 'Allow',
        Action: [
          'dynamodb:List*',
          'dynamodb:DescribeReservedCapacity*',
          'dynamodb:DescribeLimits',
          'dynamodb:DescribeTimeToLive',
        ],
        Resource: '*',
      },
      {
        Sid: 'SpecificTable',
        Effect: 'Allow',
        Action: [
          'dynamodb:BatchGet*',
          'dynamodb:DescribeStream',
          'dynamodb:DescribeTable',
          'dynamodb:Get*',
          'dynamodb:Query',
          'dynamodb:Scan',
          'dynamodb:BatchWrite*',
          'dynamodb:Delete*',
          'dynamodb:Update*',
          'dynamodb:PutItem',
        ],
        Resource: tableArn,
      },
    ],
  })),
})

const lambdaRole = new aws.iam.Role('lambdaRole', {
  assumeRolePolicy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'sts:AssumeRole',
        Principal: {
          Service: 'lambda.amazonaws.com',
        },
        Effect: 'Allow',
        Sid: '',
      },
    ],
  }),
})

new aws.iam.RolePolicyAttachment(
  'RolePolicyAttachment',
  {
    role: lambdaRole,
    policyArn: tableAccessPolicy.arn,
  }
)

const callbackFunction = new aws.lambda.CallbackFunction(
  'callbackFunction',
  {
    role: lambdaRole,
    callback: handler(table.name),
  }
)

const api = new apigateway.RestAPI('api', {
  routes: [{
    method: 'GET',
    path: '/',
    eventHandler: callbackFunction,
  }]
})

export const dbTable = table
export const url = api.url


import * as pulumi from '@pulumi/pulumi';
import "mocha"

pulumi.runtime.setMocks(
  {
    newResource: function (args: pulumi.runtime.MockResourceArgs): {
      id: string;
      // This is the declared type upstream: https://www.pulumi.com/docs/reference/pkg/nodejs/pulumi/pulumi/runtime/#Mocks-newResource
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      state: Record<string, any>;
    } {
      return {
        id: `${args.name}_id`,
        state: args.inputs,
      };
    },
    call: function (args: pulumi.runtime.MockCallArgs) {
      return args.inputs;
    },
  },
  'project',
  'stack',
  false
);

describe('infrastructure', () => {
  let infra: typeof import('./index');

  before(async function () {
    // It's important to import the program _after_ the mocks are defined.
    infra = await import('./index');
  });

  it("doesn't break anything", (done) => {
    pulumi.all([infra.endpointUrl]).apply(([url]) => {
      if(url != 'undefinedstage/') {
        done(new Error(`Bad endpoint: ${url}`))
      } else {
        done()
      }
    })
  })

});

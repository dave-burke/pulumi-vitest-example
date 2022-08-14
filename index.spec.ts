import * as pulumi from '@pulumi/pulumi';
import { describe, it, expect, beforeAll } from 'vitest';

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

  beforeAll(async function () {
    // It's important to import the program _after_ the mocks are defined.
    infra = await import('./index');
  });

  it("doesn't break math", () => {
    expect(1).toBe(1);
  })

});

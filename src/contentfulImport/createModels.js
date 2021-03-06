import ora from 'ora';
import Progress from './progress';
import { toItemApiKey } from './toApiKey';

export default async ({ datoClient, contentfulData }) => {
  const spinner = ora().start();
  try {
    const { contentTypes } = contentfulData;

    const progress = new Progress(contentTypes.length, 'Creating models');
    spinner.text = progress.tick();

    const itemTypes = [];

    for (const contentType of contentTypes) {
      const itemTypeApiKey = toItemApiKey(contentType.sys.id);
      const itemAttributes = {
        apiKey: itemTypeApiKey,
        name: contentType.name,
        modularBlock: false,
        orderingDirection: null,
        singleton: false,
        sortable: false,
        tree: false,
        orderingField: null,
        draftModeActive: true,
      };

      const itemType = await datoClient.itemTypes.create(itemAttributes);
      spinner.text = progress.tick();
      itemTypes.push(itemType);
    }

    spinner.succeed();

    return itemTypes;
  } catch (e) {
    spinner.fail();
    throw e;
  }
};

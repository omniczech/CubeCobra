import React from 'react';
import { FetchMock } from '@react-mock/fetch';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import CubeListPage from 'pages/CubeListPage';
import { treeCache } from 'components/AutocompleteInput';
import { act } from 'react-dom/test-utils';
import { fromEntries } from 'utils/Util';
import exampleCube from '../../../fixtures/examplecube';
import exampleCardsFull from '../../../fixtures/examplecardsdetails';

process.env.DEBUG_PRINT_LIMIT = 100000;

const cube = {
  ...exampleCube,
  cards: exampleCardsFull,
  maybe: exampleCardsFull,
  default_sorts: ['Color Category', 'Types-Multicolor'],
};

const element = () => (
  <FetchMock
    mocks={[
      { matcher: '/cube/api/cardnames', response: { success: 'true' } },
      { matcher: '/cube/api/cubecardnames/1', response: { success: 'true' } },
      {
        matcher: '/cube/api/getversions',
        response: {
          success: 'true',
          dict: fromEntries(
            exampleCardsFull.map((card) => [
              card.cardID,
              [
                {
                  id: card.cardID,
                  version: card.details.full_name
                    .toUpperCase()
                    .substring(card.details.full_name.indexOf('[') + 1, card.details.full_name.indexOf(']')),
                  img: card.details.image_normal,
                },
              ],
            ]),
          ),
        },
      },
    ]}
  >
    <CubeListPage
      cube={cube}
      maybe={exampleCardsFull}
      defaultView="table"
      defaultFilterText=""
      defaultTagColors={[]}
      defaultShowTagColors
      defaultPrimarySort=""
      defaultSecondarySort=""
      user={{
        id: '5d671c495c4dcdeca1a2f7c8',
        username: 'sensitiveemmett',
        notifications: [],
      }}
    />
  </FetchMock>
);

test('CubeListPage has major functionality', async () => {
  const {
    findByAltText,
    findByPlaceholderText,
    findByDisplayValue,
    findByText,
    getAllByText,
    getByDisplayValue,
    getByPlaceholderText,
    getByText,
  } = render(element());

  expect(getByText(exampleCardsFull[0].details.name));

  // The tests in this file should be integration tests for the whole CubeListPage thing.
  // Test View
  const viewSelect = await findByDisplayValue('Table View');
  for (const view of ['table', 'curve']) {
    fireEvent.change(viewSelect, { target: { value: view } });
    expect(await findByText(exampleCardsFull[0].details.name));
  }

  fireEvent.change(viewSelect, { target: { value: 'spoiler' } });
  expect(await findByAltText(exampleCardsFull[0].details.name));

  fireEvent.change(viewSelect, { target: { value: 'table' } });
  await findByText(exampleCardsFull[0].details.name);

  // Test Sort Collapse: can we change the sort?
  fireEvent.click(getByText('Sort'));
  await findByText('Primary Sort');
  fireEvent.change(getByDisplayValue('Color Category'), { target: { value: 'Color Identity' } });
  fireEvent.change(getByDisplayValue('Types-Multicolor'), { target: { value: 'Unsorted' } });

  for (const card of exampleCardsFull) {
    expect(getAllByText(card.details.name).length).toBeGreaterThan(0);
  }
});

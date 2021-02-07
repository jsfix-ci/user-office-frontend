import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import React from 'react';

import { SearchCriteriaInputProps } from 'components/common/proposalFilters/QuestionaryFilter';
import { QuestionFilterCompareOperator } from 'generated/sdk';

function BooleanSearchCriteriaInput({ onChange }: SearchCriteriaInputProps) {
  return (
    <FormControl style={{ width: '80px' }}>
      <InputLabel shrink id="is-checked">
        Value
      </InputLabel>
      <Select
        onChange={event => {
          onChange(
            QuestionFilterCompareOperator.EQUALS,
            event.target.value === 'yes'
          );
        }}
        labelId="is-checked"
      >
        <MenuItem key="yes" value={'yes'}>
          Yes
        </MenuItem>
        <MenuItem key="no" value={'no'}>
          No
        </MenuItem>
      </Select>
    </FormControl>
  );
}

export default BooleanSearchCriteriaInput;

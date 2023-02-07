import React, { useState } from 'react';
import { Select, SelectProps } from 'antd';

export type SelectOption = { label: string, value: string}
type SearchSelectProps = Omit<SelectProps<string, SelectOption>, 'children'>

export const selectFilterOption = (input: string, option: SelectOption | undefined) => (
  (option?.label.toLowerCase().indexOf(input.toLowerCase()) ?? 0) >= 0
);

export const selectFilterSort = (optionA: SelectOption, optionB: SelectOption) => (
  optionA.label.toLowerCase().localeCompare(optionB.label.toLowerCase())
);

export const SearchSelect = ({ ...props }: SearchSelectProps) => (
  <Select
    allowClear
    showSearch
    showArrow
    filterOption={selectFilterOption}
    filterSort={selectFilterSort}
    {...props}
  />
);
export const AutoClearSearchSelect = ({
  onSelectChange, children, ...props
}: { onSelectChange: Function } & SelectProps<any>) => {
  const [selectValue, setSelectValue] = useState<string>('');
  return (
    <Select
      {...props}
      showSearch
      showArrow={false}
      value={selectValue}
      filterOption={(input, option: any) => {
        if (children) {
          return option.items.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }
        return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      }}
      onChange={(value) => {
        setSelectValue('');
        onSelectChange(value);
      }}
    >
      {children}
    </Select>
  );
};

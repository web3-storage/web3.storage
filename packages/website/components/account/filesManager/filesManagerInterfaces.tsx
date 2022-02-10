// /////////////////////////////////////////////////////////////////////// Table
interface CTAProps {
  text: string;
  theme: string;
  ui: string;
  action: string;
}

interface FileRowLabelsProps {
  date: string;
  name: string;
  cid: string;
  status: string;
  storage_providers: string;
  size: string;
  available: string;
  delete: string;
}

interface TableProps {
  message: string;
  cta: CTAProps;
  file_row_labels: FileRowLabelsProps;
}

// ////////////////////////////////////////////////////////////////////////// UI
interface OptionProps {
  label: string;
  value: string;
}

interface ResultsProps {
  options: OptionProps[];
}

interface DeleteProps {
  text: string;
  alert: string;
}

interface SortByOptionProps {
  label: string;
  key: string;
  value: string;
  direction: string;
  compareFn: string;
}

interface SortbyProps {
  label: string;
  options: SortByOptionProps;
}

interface UIProps {
  filter_placeholder: string;
  refresh: string;
  sortby: SortbyProps;
  delete: DeleteProps;
  results: ResultsProps;
}

// ////////////////////////////////////////////////////////////////////// Export
export interface ContentProps {
  heading: string;
  table: TableProps;
  ui: UIProps;
}

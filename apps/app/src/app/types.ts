export type LengthCountType = {
  loading: boolean;
  value: number;
};

export type ProfileType = {
  albumId: number | string;
  id: number | string;
  title: string;
  url: string;
  thumbnailUrl: string;
};

export type ProfileListType = {
  loading: boolean;
  list: unknown & Array<ProfileType>;
  page: number;
};

export type GetDataType = {
  action: string;
  period: 'initial' | 'next' | 'prev' | 'pageNumber';
  thePageNumber: number;
};

export const listPageSize = 50;

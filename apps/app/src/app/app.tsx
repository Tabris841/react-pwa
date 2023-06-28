// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useMemo, useState } from 'react';
import styles from './app.module.css';

import { processList } from './longProcesses/enums';
import Loader from './components/Loader';
import Table from './components/Table';
import Pagination from './components/Pagination';
import {
  GetDataType,
  LengthCountType,
  ProfileListType,
  listPageSize,
} from './types';

export function App() {
  const [lengthCount, setLengthCount] = useState<LengthCountType>({
    loading: true,
    value: 0,
  });

  const [profileList, setProfileList] = useState<ProfileListType>({
    loading: true,
    list: [],
    page: 1,
  });

  const counter: Worker = useMemo(
    () => new Worker(new URL('./longProcesses/count.ts', import.meta.url)),
    []
  );

  const getData: Worker = useMemo(
    () => new Worker(new URL('./longProcesses/getData.ts', import.meta.url)),
    []
  );

  useEffect(() => {
    if (window.Worker) {
      counter.postMessage(processList.count);
    }
  }, [counter]);

  useEffect(() => {
    if (window.Worker) {
      counter.onmessage = (e: MessageEvent<string>) => {
        setLengthCount((prev) => ({
          ...prev,
          loading: false,
          value: Number(e.data) && Number(e.data),
        }));
      };
    }
  }, [counter]);

  useEffect(() => {
    if (window.Worker) {
      const request = {
        action: processList.getData,
        period: 'initial',
        thePageNumber: profileList.page,
      } as GetDataType;

      getData.postMessage(JSON.stringify(request));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (window.Worker) {
      getData.onmessage = (e: MessageEvent<string>) => {
        const response = JSON.parse(e.data) as unknown as ProfileListType;

        setProfileList((prev) => ({
          ...prev,
          loading: response.loading,
          list: response.list,
          page: response.page,
        }));
      };
    }
  }, [getData]);

  const handlePageNumber = (userSelectedPage: number) => {
    if (window.Worker) {
      const request = {
        action: processList.getData,
        period: 'pageNumber',
        thePageNumber: userSelectedPage,
      } as GetDataType;

      getData.postMessage(JSON.stringify(request));
    }
  };

  const prevHandler = (userSelectedPage: number) => {
    if (profileList.page === 1) {
      return;
    }

    if (window.Worker) {
      const request = {
        action: processList.getData,
        period: 'prev',
        thePageNumber: userSelectedPage - 1,
      } as GetDataType;

      getData.postMessage(JSON.stringify(request));
    }
  };

  const nextHandler = (userSelectedPage: number, thePageLength: number) => {
    if (userSelectedPage < thePageLength) {
      if (window.Worker) {
        const request = {
          action: processList.getData,
          period: 'next',
          thePageNumber: userSelectedPage + 1,
        } as GetDataType;

        getData.postMessage(JSON.stringify(request));
      }
    }
  };

  return (
    <main className="main-container">
      <section className="count">
        Total count of Profiles is{' '}
        <b>{lengthCount.loading ? <Loader size={14} /> : lengthCount.value}</b>
      </section>
      <section className="table-container">
        {profileList.loading ? (
          <Loader size={40} display="block" />
        ) : (
          <>
            <Table list={profileList.list} />
            <Pagination
              page={profileList.page}
              pages={lengthCount.value / listPageSize}
              pageClick={(pageNumber) => {
                handlePageNumber(pageNumber);
              }}
              prevHandler={() => prevHandler(profileList.page)}
              nextHandler={() =>
                nextHandler(profileList.page, lengthCount.value / listPageSize)
              }
            />
          </>
        )}
      </section>
    </main>
  );
}

export default App;

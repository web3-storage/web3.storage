import { useRouter } from "next/router";
import { Web3Storage } from "web3.storage";
import { useQueryClient } from "react-query";
import { useDropzone } from "react-dropzone";
import { useRef, useState, useContext, useCallback } from "react";
import { When } from "react-if";
import clsx from "clsx";
import Link from "next/link";
import prettyBytes from "pretty-bytes";
import pMap from "p-map";

import countly from "../lib/countly";
import { getToken, API } from "../lib/api";
import {
  useProgress as useUploadProgress,
  STATUS,
  FilesContext,
} from "../components/upload";
import Alert from "../components/alert.js";
import Button from "../components/button.js";
import Loading from "../components/loading";
import Cross from "../icons/cross";
import Tooltip from "../components/tooltip";

const MAX_CONCURRENT_UPLOADS = 5;

export function getStaticProps() {
  return {
    props: {
      title: "Upload - Web3 Storage",
      redirectTo: "/",
      needsLoggedIn: true,
    },
  };
}

/**
 *
 * @param {Object} props
 * @param {import('../components/upload').FileProgress} props.file
 * @param {String} [props.className]
 * @returns
 */
function File({ file, className }) {
  return (
    <div
      className={clsx(
        className,
        "relative mr-2 mb-2 px-2 py-1 border border-w3storage-black text-black leading-normal transition-colors overflow-hidden",
        // @ts-ignore
        file.status !== STATUS.FAILED
          ? "bg-w3storage-red-light"
          : "bg-w3storage-red bg-opacity-50"
      )}
    >
      <div
        className={clsx(
          "absolute z-0 top-0 right-full bottom-0 -left-full transition bg-w3storage-green bg-opacity-25"
        )}
        style={{
          transform: `translateX(${file.progress.percentage}%)`,
        }}
      />
      <div className="text-sm truncate">{file.name}</div>
      <div className="text-xs opacity-80">{prettyBytes(file.size)}</div>
    </div>
  );
}

/**
 *
 * @param {Object} props
 * @param {import('../components/upload').UploadProgress} props.progress
 * @returns
 */
function Files({ progress }) {
  const fileWrapperClassName = "overflow-hidden";
  const files = Object.values(progress.files);

  return (
    <>
      {files.map((file) =>
        // @ts-ignore
        file.status === STATUS.FAILED ? (
          <Tooltip
            key={file.name}
            placement="top"
            overlay={
              <span>
                Error:{" "}
                {progress.files[file.name].error?.message ||
                  "Upload failed with unknown error. Please try again."}
              </span>
            }
          >
            <div className={fileWrapperClassName}>
              <File file={progress.files[file.name]} />
            </div>
          </Tooltip>
        ) : (
          <File
            key={file.name}
            className={fileWrapperClassName}
            file={progress.files[file.name]}
          />
        )
      )}
      {!progress.ready && "No file(s) chosen"}
    </>
  );
}

export default function Upload() {
  const queryClient = useQueryClient();
  const [finished, setFinished] = useState(false);
  const [uploading, setUploading] = useState(false);

  const /** @type {React.MutableRefObject<HTMLInputElement|null>} */ inputRef =
      useRef(null);
  const { files, set: setFiles } = useContext(FilesContext);
  const {
    progress,
    initialize,
    updateFileProgress,
    markFileCompleted,
    markFileFailed,
  } = useUploadProgress(files);

  /** @param {import('react').ChangeEvent<HTMLFormElement>} e */
  async function handleUploadSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    const file = data.get("file");
    if (file && file instanceof File) {
      await uploadFile(file);
    }
  }

  const uploadFiles = useCallback(async () => {
    setUploading(true);

    const client = new Web3Storage({
      token: await getToken(),
      endpoint: new URL(API),
    });

    try {
      const uploadFile = async (
        /** @type import('../components/upload').FileProgress} */ file
      ) => {
        try {
          await client.put([file.inputFile], {
            name: file.name,
            onStoredChunk: (size) => updateFileProgress(file, size),
          });
        } catch (error) {
          markFileFailed(file, error);
          console.error(error);
          return;
        }

        markFileCompleted(file);
      };

      await pMap(Object.values(progress.files), uploadFile, {
        concurrency: MAX_CONCURRENT_UPLOADS,
      });
    } finally {
      await queryClient.invalidateQueries("get-uploads");
      setUploading(false);
      setFinished(true);
      // @ts-ignore
      setFiles([]);
    }
  }, [
    updateFileProgress,
    markFileCompleted,
    markFileFailed,
    progress.files,
    setFiles,
    queryClient,
  ]);

  const onSubmit = useCallback(
    (event) => {
      event.preventDefault();

      progress.ready && uploadFiles();
    },
    [progress.ready, uploadFiles]
  );

  /** @param {File[]} acceptedFiles */
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (uploading) {
        return;
      }

      initialize(acceptedFiles);
      // @ts-ignore
      setFiles(acceptedFiles);
      setFinished(false);
    },
    [initialize, uploading, setFiles]
  );
  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const openInput = useCallback(() => inputRef?.current?.click(), []);

  const onInputChange = useCallback(() => {
    const fileInput = inputRef?.current;

    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      return;
    }

    const files = Array.from(fileInput.files);

    // @ts-ignore
    initialize(files);
    // @ts-ignore
    setFiles(files);
    setFinished(false);
  }, [initialize, setFiles]);

  return (
    <main
      className="layout-margins my-4 sm:my-16 text-w3storage-purple h-full flex-grow"
      {...getRootProps()}
    >
      <div className="flex flex-col items-center">
        <div>
          <h2>Upload File</h2>
          <form
            onSubmit={handleUploadSubmit}
            className="flex flex-col items-start pt-8"
          >
            <div className="mb-4 flex flex-col items-start">
              <label htmlFor="name" className="mb-2">
                File:
              </label>
              <input
                ref={inputRef}
                id="files"
                name="files"
                type="file"
                className="hidden"
                required
                multiple
                onChange={onInputChange}
              />
              <div className="flex items-center border-w3storage-red border-dashed border-2 p-3">
                <Button
                  variant="light"
                  className="border border-w3storage-purple focus:border-w3storage-purple"
                  onClick={openInput}
                  disabled={uploading}
                >
                  Choose File(s)
                </Button>

                <div className="flex relative z-1 flex-wrap items-center px-4 overflow-y-auto max-h-48">
                  <Files progress={progress} />
                </div>
              </div>
            </div>
            <div>
              <Button
                type="button"
                disabled={uploading || !progress.ready || finished}
                id="upload-file"
                tracking={{
                  event: countly.events.FILE_UPLOAD_CLICK,
                  ui: countly.ui.UPLOAD,
                }}
                onClick={onSubmit}
              >
                {uploading ? (
                  <Loading className="user-spinner" fill="white" height={10} />
                ) : (
                  "Upload"
                )}
              </Button>
              <div
                className={clsx("ml-8 w-full pt-1", {
                  hidden: !uploading && !finished,
                })}
              >
                <div
                  className={clsx(
                    "relative overflow-hidden text-sm border-2 h-6 bg-w3storage-purple bg-opacity-25",
                    finished
                      ? "border-w3storage-purple"
                      : "border-w3storage-blue-desaturated"
                  )}
                >
                  <div className="z-10 relative text-center font-bold h-full text-w3storage-white drop-shadow-lg">
                    {progress.percentage}%
                  </div>
                  <div
                    className={clsx(
                      "absolute z-0 top-0 right-full bottom-0 -left-full transition",
                      finished
                        ? "bg-w3storage-purple"
                        : "bg-w3storage-blue-desaturated"
                    )}
                    style={{ transform: `translateX(${progress.percentage}%)` }}
                  />
                  <div
                    className={clsx(
                      "absolute z-0 top-0 -right-full bottom-0 left-full transition",
                      {
                        "bg-transparent": progress.failed.number === 0,
                        "bg-w3storage-red bg-opacity-75":
                          progress.failed.number > 0 && finished,
                      }
                    )}
                    style={{
                      transform: `translateX(${progress.percentage - 100}%)`,
                    }}
                  />
                </div>
                <div className="flex justify-between leading-7 text-sm flex-wrap sm:flex-nowrap">
                  <div>
                    {`Files: ${progress.completed.number}/${progress.total.number}`}
                    <span className="text-w3storage-red-dark">
                      {progress.failed.number
                        ? ` (${progress.failed.number} failed)`
                        : ""}
                    </span>
                  </div>
                  <div>{`${prettyBytes(progress.completed.size).replace(
                    " ",
                    ""
                  )}/${prettyBytes(progress.total.size).replace(
                    " ",
                    ""
                  )}`}</div>
                </div>
              </div>
            </div>
            <div>
              <p className="pt-4 text-sm">
                You can also upload files using the{" "}
                <a
                  href="https://www.npmjs.com/package/web3.storage"
                  className="black underline"
                >
                  JS Client Library
                </a>
                .
              </p>
            </div>
          </form>
          {isDragActive && (
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-800 bg-opacity-40 flex justify-center items-center">
              <div className="bg-white p-4 border rounded">
                <div className="bg-blue-100 bg-opacity-80 p-4 md:p-16 border-2 border-gray-300 border-dashed">
                  Drop the file here to upload it.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-16 max-w-xl mx-auto">
        <div className="mb-8">
          <p className="font-semibold">🌍 Public data</p>
          <p className="text-sm leading-6">
            All data uploaded to Web3.Storage is available to anyone who
            requests it using the correct CID. Do not store any private or
            sensitive information in an unencrypted form using Web3.Storage.
          </p>
        </div>
        <div>
          <p className="font-semibold">♾️ Permanent data</p>
          <p className="text-sm leading-6">
            Deleting files from the Web3.Storage site’s{" "}
            <Link href="/files">
              <a className="text-sm font-bold no-underline hover:underline">
                Files
              </a>
            </Link>{" "}
            page will remove them from the file listing for your account, but
            that doesn’t prevent nodes on the{" "}
            <a
              className="text-sm font-bold no-underline hover:underline"
              href="https://docs.web3.storage/concepts/decentralized-storage/"
              target="_blank"
              rel="noreferrer"
            >
              decentralized storage network
            </a>{" "}
            from retaining copies of the data indefinitely. Do not use
            Web3.Storage for data that may need to be permanently deleted in the
            future.
          </p>
        </div>
      </div>
    </main>
  );
}

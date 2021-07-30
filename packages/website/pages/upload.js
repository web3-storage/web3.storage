import { useRouter } from "next/router";
import { Web3Storage } from "web3.storage";
import { useQueryClient } from "react-query";
import { useDropzone } from "react-dropzone";
import { useRef, useState } from "react";

import countly from "../lib/countly";
import { getToken, API } from "../lib/api";
import Button from "../components/button.js";

export function getStaticProps() {
  return {
    props: {
      title: "Upload - Web3 Storage",
      redirectTo: "/",
      needsUser: true,
    },
  };
}

export default function Upload() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [/** @type {string|null} */ inputFile, setInputFile] = useState({ name: '' });
  const /** @type {React.MutableRefObject<HTMLInputElement|null>} */ inputRef = useRef(null);
  const [percentComplete, setPercentComplete] = useState(0);

  /** @param {import('react').ChangeEvent<HTMLFormElement>} e */
  async function handleUploadSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    const file = data.get("file");
    if (file && file instanceof File) {
      await uploadFile(file)
    }
  }

  /** @param {File} file */
  async function uploadFile(file) {
    const client = new Web3Storage({
      token: await getToken(),
      endpoint: new URL(API),
    });
    setUploading(true);
    try {
      let totalBytesSent = 0;
      await client.put([file], {
        name: file.name,
        onStoredChunk: (size) => {
          totalBytesSent += size;
          setPercentComplete(Math.round((totalBytesSent / file.size) * 100));
        },
      });
    } finally {
      await queryClient.invalidateQueries("get-uploads");
      setUploading(false);
      router.push("/files");
    }
  }

  /** @param {File[]} acceptedFiles */
  const onDrop = (acceptedFiles) => uploadFile(acceptedFiles[0]);
  const { getRootProps, isDragActive } = useDropzone({ onDrop, multiple: false });

  const openInput = () => { 
    const fileInput = inputRef?.current;
    fileInput && fileInput.click()
  }

  const onInputChange = () => {
    const fileInput = inputRef?.current;
    if(!fileInput || !fileInput.files || !fileInput.files[0]) return;

    const file = fileInput.files[0]
    setInputFile({ name: file.name })
  }

  return (
    <main className="p-4 sm:px-16 mt-4 sm:mt-16 text-w3storage-purple h-full flex-grow" {...getRootProps()}>
      <div className="mw9 pv3 ph3 ph5-ns min-vh-100 flex flex-col items-center">
        <div className="p-6">
          <h2>Upload File</h2>
          <form onSubmit={handleUploadSubmit} className='flex flex-col items-start py-8'>
            <div className="my-4 flex flex-col items-start">
              <label htmlFor="name" className="mb-2">
                File:
              </label>
              <input
                ref={inputRef}
                id="file"
                name="file"
                type="file"
                className="hidden"
                required
                onChange={onInputChange}
              />
              <div className="flex items-center border-w3storage-red border-dashed border-2 p-3">
                <Button variant='light' className='border border-w3storage-purple focus:border-w3storage-purple' onClick={openInput}>Choose File</Button>
                <p className="px-4">{ inputFile.name.length > 0 ? inputFile.name : 'No file chosen'}</p>
              </div>
            </div>
            <div className="mv3">
              <Button
                className="bg-nslime"
                type="submit"
                disabled={uploading || !inputRef?.current?.files || inputRef?.current?.files?.length === 0}
                id="upload-file"
                tracking={{
                  event: countly.events.FILE_UPLOAD_CLICK,
                  ui: countly.ui.UPLOAD,
                }}
              >
                {uploading
                  ? `Uploading...${
                      percentComplete ? `(${percentComplete}%)` : ""
                    }`
                  : "Upload"}
              </Button>
            </div>
            <div>
              <p className="pt-4 text-sm">
                You can also upload files using the{" "}
                <a href="https://www.npmjs.com/package/web3.storage" className="black underline">
                  JS Client Library
                </a>.
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
    </main>
  );
}

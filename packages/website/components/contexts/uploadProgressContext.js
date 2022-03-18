import { useReducer, useCallback } from 'react';

/**
 * @typedef {{
 *   percentage: number,
 *   total: UploadState,
 *   completed: UploadState,
 *   failed: { number: number },
 *   files: FilesProgress,
 *   ready: boolean
 * }} UploadProgress
 *
 * @typedef {{ number: number, size: number }} UploadState
 * @typedef {{ [filename: string]: FileProgress }} FilesProgress
 * @typedef {{
 *   name: string,
 *   size: number,
 *   status: keyof STATUS,
 *   progress: FileProgressDetails,
 *   inputFile: File,
 *   error: Error,
 *   uploadId: string
 * }} FileProgress
 * @typedef {{
 *   total: number,
 *   uploaded: number,
 *   percentage: number
 * }} FileProgressDetails
 */

export const STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

const actions = {
  FILES_READY: 'files_ready',
  FILE_UPLOAD_UPDATE: 'file_upload_update',
  FILE_UPLOAD_COMPLETED: 'file_upload_completed',
  FILE_UPLOAD_FAILED: 'file_upload_failed',
};

// @ts-ignore
function sumProp(array, prop) {
  // @ts-ignore
  return array.reduce((sum, item) => sum + item[prop], 0);
}

// @ts-ignore
function computeSizeProgress(state, completedFile) {
  const files = Object.values(state.files);
  const completedFiles = files.filter(file => file.status === STATUS.COMPLETED);
  const uploadingFiles = files
    .filter(file => file.status === STATUS.UPLOADING && (completedFile ? file.name !== completedFile.name : true))
    .map(file => file.progress);

  return (
    sumProp(completedFiles, 'size') + sumProp(uploadingFiles, 'uploaded') + (completedFile ? completedFile.size : 0)
  );
}

const getFileProgress = (files, file) =>
  files[file.uploadId] || Object.values(files).find(({ inputFile }) => inputFile === file);

const reducers = {
  // @ts-ignore
  filesReady(/** @type (FileProgress|File)[] */ files = []) {
    const totalSize = files.reduce((total, file) => total + (file.inputFile?.size || file.size), 0) || 0;
    return /** @type UploadProgress */ {
      percentage: 0,
      completed: { number: 0, size: 0 },
      failed: { number: 0 },
      total: { number: files.length, size: totalSize },
      files: files.reduce((fileObject, fileTarget) => {
        const file = fileTarget.inputFile || fileTarget;
        const uploadId = fileTarget.uploadId || `${file.name}-${new Date().getTime()}`;

        return {
          ...fileObject,
          [uploadId]:
            // If the file has an upload id, it means it has already been registered, else create a new entry
            !!fileTarget.uploadId
              ? fileTarget
              : {
                  name: file.name,
                  size: file.size,
                  status: STATUS.PENDING,
                  progress: { total: file.size, uploaded: 0, percentage: 0 },
                  inputFile: file,
                  uploadId,
                },
        };
      }, {}),
      ready: files.length > 0,
    };
  },
  // @ts-ignore
  fileUploadUpdate(state, { file, chunkSizeUploaded }) {
    /** @type FilesProgress */
    const files = state.files;
    /** @type FileProgress */
    const fileProgress = getFileProgress(files, file);
    const uploaded = fileProgress ? fileProgress.progress.uploaded + chunkSizeUploaded : chunkSizeUploaded;
    const newCompletedSize = computeSizeProgress(state) + chunkSizeUploaded;
    const newState = {
      ...state,
      percentage: Math.min(99, Math.round((newCompletedSize * 100) / state.total.size)),
      completed: {
        ...state.completed,
        size: newCompletedSize,
      },
      files: {
        ...state.files,
        [fileProgress.uploadId]: {
          ...fileProgress,
          status: STATUS.UPLOADING,
          progress: {
            total: file.size,
            uploaded,
            percentage: Math.min(99, Math.round((uploaded * 100) / file.size)),
          },
        },
      },
    };

    return newState;
  },
  // @ts-ignore
  fileUploadComplete(state, { file }) {
    /** @type FilesProgress */
    const files = state.files;
    /** @type FileProgress */
    const fileProgress = getFileProgress(files, file);
    const newCompletedSize = computeSizeProgress(state, fileProgress);
    const newState = {
      ...state,
      percentage: Math.min(
        state.completed.number + 1 === state.total.number ? 100 : 99,
        Math.round((newCompletedSize * 100) / state.total.size)
      ),
      completed: {
        ...state.completed,
        size: newCompletedSize,
        number: state.completed.number + 1,
      },
      files: {
        ...state.files,
        [fileProgress.uploadId]: {
          ...fileProgress,
          status: STATUS.COMPLETED,
          progress: {
            ...fileProgress.progress,
            uploaded: fileProgress.size,
            percentage: 100,
          },
        },
      },
    };

    return newState;
  },
  // @ts-ignore
  fileUploadFailed(state, { file, error }) {
    /** @type FilesProgress */
    const files = state.files;
    /** @type FileProgress */
    const fileProgress = getFileProgress(files, file);
    const newCompletedSize = computeSizeProgress(state);

    const newState = {
      ...state,
      percentage: Math.min(
        state.completed.number === state.total.number ? 100 : 99,
        Math.round((newCompletedSize * 100) / state.total.size)
      ),
      completed: {
        ...state.completed,
        size: newCompletedSize,
      },
      failed: {
        ...state.failed,
        number: state.failed.number + 1,
      },
      files: {
        ...state.files,
        [fileProgress.uploadId]: {
          ...fileProgress,
          status: STATUS.FAILED,
          progress: {
            ...fileProgress.progress,
            uploaded: 0,
            percentage: 0,
          },
          error,
        },
      },
    };

    return newState;
  },
};

// @ts-ignore
function reducer(state, action) {
  switch (action.type) {
    case actions.FILES_READY:
      return reducers.filesReady(action.payload.files);
    case actions.FILE_UPLOAD_UPDATE:
      return reducers.fileUploadUpdate(state, action.payload);
    case actions.FILE_UPLOAD_COMPLETED:
      return reducers.fileUploadComplete(state, action.payload);
    case actions.FILE_UPLOAD_FAILED:
      return reducers.fileUploadFailed(state, action.payload);
    default:
      throw new Error('[lib/upload] useProgress: action type not recognized');
  }
}

export function useUploadProgress(/** @type{File[]} */ files = []) {
  const [/** @type UploadProgress */ state, dispatch] = useReducer(reducer, files, reducers.filesReady);

  const initialize = useCallback(
    files =>
      // @ts-ignore
      dispatch({ type: actions.FILES_READY, payload: { files } }),
    []
  );
  const updateFileProgress = useCallback(
    (file, chunkSizeUploaded) =>
      // @ts-ignore
      dispatch({ type: actions.FILE_UPLOAD_UPDATE, payload: { file, chunkSizeUploaded } }),
    []
  );
  const markFileCompleted = useCallback(
    file =>
      // @ts-ignore
      dispatch({ type: actions.FILE_UPLOAD_COMPLETED, payload: { file } }),
    []
  );
  const markFileFailed = useCallback(
    (file, error) =>
      // @ts-ignore
      dispatch({ type: actions.FILE_UPLOAD_FAILED, payload: { file, error } }),
    []
  );

  return {
    /** @type {UploadProgress} */
    progress: state,
    initialize,
    updateFileProgress,
    markFileCompleted,
    markFileFailed,
  };
}

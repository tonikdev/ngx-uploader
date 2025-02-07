import { Subscription } from 'rxjs';

export interface UploaderOptions {
  concurrency: number;
  allowedContentTypes?: string[];
  maxUploads?: number;
  maxFileSize?: number;
}

export interface BlobFile extends Blob {
  name: string;
}

export enum UploadStatus {
  Queue,
  Uploading,
  Done,
  Cancelled
}

export interface UploadProgress {
  status: UploadStatus;
  data?: {
    percentage: number;
    speed: number;
    speedHuman: string;
    startTime: number | null;
    endTime: number | null;
    eta: number | null;
    etaHuman: string | null;
  };
}

export interface UploadFile {
  id: string;
  fileIndex: number;
  lastModifiedDate: Date;
  name: string;
  size: number;
  type: string;
  form: FormData;
  progress: UploadProgress;
  response?: any;
  responseStatus?: number;
  sub?: Subscription | any;
  nativeFile?: File;
  responseHeaders?: { [key: string]: string };
}

export interface UploadOutput {
  type: 'addedToQueue' | 'allAddedToQueue' | 'uploading' | 'done' | 'start' | 'cancelled' | 'dragOver'
      | 'dragOut' | 'drop' | 'removed' | 'removedAll' | 'rejected';
  file?: UploadFile;
  nativeFile?: File;
}

export interface UploadInput {
  type: 'uploadAll' | 'uploadFile' | 'cancel' | 'cancelAll' | 'remove' | 'removeAll';
  sendDataType?: 'json' | 'formdata' | 'blob';
  url?: string;
  method?: string;
  id?: string;
  fieldName?: string;
  fileIndex?: number;
  file?: UploadFile;
  data?: { [key: string]: string | Blob };
  headers?: { [key: string]: string };
  includeWebKitFormBoundary?: boolean; // If false, only the file is send trough xhr.send (WebKitFormBoundary is omit)
  withCredentials?: boolean;
}

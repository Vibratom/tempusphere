declare module 'file-saver' {
  export function saveAs(data: Blob | string, filename?: string, options?: FileSaver.FileSaverOptions): void;
}

declare namespace FileSaver {
  interface FileSaverOptions {
    autoBom?: boolean;
  }
}

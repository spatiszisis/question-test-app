import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { UploadFileDirective } from '../../core/dropfile.directive';

@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [CommonModule, UploadFileDirective],
  templateUrl: './upload-file.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadFileComponent {
  ref = inject(ChangeDetectorRef);
  files: any[] = [];
  @Input() uploadedFile: any;
  @Output() filesUploaded = new EventEmitter<any>();

  /**
   * on file drop handler
   */
  onFileDropped($event) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler($event) {
    this.prepareFilesList($event.target.files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    this.files.splice(index, 1);
    this.filesUploaded.emit('');
  }

  /**
   * Simulate the upload process
   */
  // uploadFilesSimulator(index: number) {
  //   setTimeout(() => {
  //     if (index === this.files.length) {
  //       return;
  //     } else {
  //       const progressInterval = setInterval(() => {
  //         if (this.files[index].progress === 100) {
  //           clearInterval(progressInterval);
  //           this.uploadFilesSimulator(index + 1);
  //         } else {
  //           this.files[index].progress += 5;
  //           this.ref.detectChanges();
  //         }
  //       }, 200);
  //     }
  //   }, 1000);
  // }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }

    const fileReader = new FileReader();
    fileReader.readAsText(files[0], 'UTF-8');
    fileReader.onload = () => {
      this.filesUploaded.emit(JSON.parse(fileReader.result as string));
    };
    fileReader.onerror = (error) => {
      console.log(error);
    };

    // this.uploadFilesSimulator(0);
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes, decimals?) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

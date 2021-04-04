import { Publisher, Subjects, ExpirationCompleteEvent } from '@mogyorosistefan/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
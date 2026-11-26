window.DevHarbourCertificateWorkspace.mount({
  event: 'innovative-india',
  endpoint: '/api/innovative-certificate',
  verify: '/api/certificates/innovative-india/verify/',
  idPattern: /^IN-26-[0-9]{7}$/,
  page: '/innovative-certificate/',
  filename: 'Innovative-India-Participation.pdf',
});

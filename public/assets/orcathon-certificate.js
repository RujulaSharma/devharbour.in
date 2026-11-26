window.DevHarbourCertificateWorkspace.mount({
  event: 'orcathon',
  endpoint: '/api/orcathon-certificate',
  verify: '/api/certificates/verify/',
  idPattern: /^DH-ORCA-[A-Za-z0-9-]{5,100}$/,
  page: '/orcathon-certificate/',
  filename: 'Orcathon-Participation.pdf',
});

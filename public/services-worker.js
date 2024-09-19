self.addEventListener('push', function(event) {
    const options = {
      body: 'Tienes un nuevo mensaje.',
      icon: '/icon.png',
      actions: [
        {action: 'open', title: 'Abrir'},
        {action: 'close', title: 'Cerrar'}
      ]
    };
  
    event.waitUntil(
      self.registration.showNotification('Nueva notificación', options)
    );
  });
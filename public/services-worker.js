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

  self.addEventListener('notificationclick', (event) => {
    event.waitUntil(
        (async () => {
            const allClients = await clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            });

            if (allClients.length > 0) {
                const client = allClients[0];
                client.focus();
            } else {
                await clients.openWindow('https://gana-online.online');
            }

            event.notification.close();
        })()
    );
});
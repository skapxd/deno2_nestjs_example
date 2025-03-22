// SharedWorker for SSE connections
let eventSource = null;
const connections = [];

// Initialize SSE connection
function initSSE(uuid) {
  if (eventSource) {
    return; // Connection already exists
  }
  
  eventSource = new EventSource(`/sse/${uuid}`);
  
  eventSource.onmessage = (event) => {
    // Broadcast the message to all connected tabs
    connections.forEach(port => {
      port.postMessage({
        type: 'message',
        data: event.data
      });
    });
  };
  
  eventSource.onerror = (error) => {
    // Broadcast error to all connected tabs
    connections.forEach(port => {
      port.postMessage({
        type: 'error',
        data: 'EventSource connection error'
      });
    });
    
    // Attempt to reconnect after a delay
    if (eventSource) {
      eventSource.close();
      eventSource = null;
      setTimeout(() => initSSE(uuid), 3000);
    }
  };
}

// Handle new connections from tabs
self.onconnect = function(e) {
  const port = e.ports[0];
  connections.push(port);
  
  port.onmessage = function(e) {
    const message = e.data;
    
    if (message.type === 'init') {
      // Initialize SSE with the UUID
      initSSE(message.uuid);
      port.postMessage({
        type: 'connected',
        data: 'Connected to SSE via SharedWorker'
      });
    } else if (message.type === 'fetch') {
      // Handle fetch requests (for buttons)
      fetch(message.url, {
        method: message.method || 'POST',
      }).catch(error => {
        port.postMessage({
          type: 'error',
          data: 'Fetch error: ' + error.message
        });
      });
    }
  };
  
  // Handle disconnection
  port.onclose = function() {
    const index = connections.indexOf(port);
    if (index > -1) {
      connections.splice(index, 1);
    }
    
    // If no more connections, close the EventSource
    if (connections.length === 0 && eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
};
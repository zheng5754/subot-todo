import type * as Party from 'partykit/server';

export default class TodoServer implements Party.Server {
  todos: any[] = [];

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    conn.send(JSON.stringify({ type: 'sync', todos: this.todos }));
  }

  onMessage(message: string, sender: Party.Connection) {
    const data = JSON.parse(message);

    if (data.type === 'update') {
      this.todos = data.todos;
      this.room.broadcast(JSON.stringify({ type: 'sync', todos: this.todos }), [sender.id]);
    }
  }
}

TodoServer satisfies Party.Worker;

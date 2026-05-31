import { describe, it, expect, vi } from 'vitest';
import { eventBus } from './eventBus';

describe('eventBus — Observer Pattern', () => {
  it('on() registra un handler que recibe el evento emitido', () => {
    const handler = vi.fn();
    eventBus.on('test:on', handler);
    eventBus.emit('test:on', { value: 1 });
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ value: 1 });
  });

  it('emit() llama al handler registrado con los datos correctos', () => {
    const handler = vi.fn();
    eventBus.on('payment:approved', handler);
    eventBus.emit('payment:approved', { transactionId: 'TXN_1' });
    expect(handler).toHaveBeenCalledWith({ transactionId: 'TXN_1' });
  });

  it('on() retorna una función que desuscribe el handler', () => {
    const handler = vi.fn();
    const unsubscribe = eventBus.on('test:unsub', handler);
    unsubscribe();
    eventBus.emit('test:unsub', {});
    expect(handler).not.toHaveBeenCalled();
  });

  it('off() elimina el handler para que no reciba más eventos', () => {
    const handler = vi.fn();
    eventBus.on('test:off', handler);
    eventBus.off('test:off', handler);
    eventBus.emit('test:off', {});
    expect(handler).not.toHaveBeenCalled();
  });

  it('soporta múltiples handlers para el mismo evento', () => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    eventBus.on('appointment:created', handlerA);
    eventBus.on('appointment:created', handlerB);
    eventBus.emit('appointment:created', { id: 'a1' });
    expect(handlerA).toHaveBeenCalledWith({ id: 'a1' });
    expect(handlerB).toHaveBeenCalledWith({ id: 'a1' });
  });

  it('emit() de un evento sin suscriptores no lanza error', () => {
    expect(() => eventBus.emit('evento:inexistente', {})).not.toThrow();
  });

  it('un handler que lanza error no impide la ejecución de los demás', () => {
    const broken = vi.fn(() => { throw new Error('roto'); });
    const ok = vi.fn();
    eventBus.on('stock:low', broken);
    eventBus.on('stock:low', ok);
    eventBus.emit('stock:low', { supplyId: 's1' });
    expect(ok).toHaveBeenCalledOnce();
  });
});

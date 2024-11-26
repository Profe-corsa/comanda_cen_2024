import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  docData,
  CollectionReference,
  query,
  where,
  getDocs,
  DocumentReference,
  onSnapshot,
  orderBy,
  deleteField,
} from '@angular/fire/firestore';
import { Mesa } from '../clases/mesa';
import { ToastService } from './toast.service';
import { Usuario } from '../clases/usuario';
import { Pedido, Estado } from '../clases/pedido';
import { Observable, BehaviorSubject } from 'rxjs';
import { collectionData } from 'rxfire/firestore';
import { map, switchMap } from 'rxjs/operators';
import { Reserva } from '../clases/Reserva';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private coleccion: any;
  private collectionSubjects: { [key: string]: BehaviorSubject<any[]> } = {};

  constructor(private firestore: Firestore, private toast: ToastService) {}

  async saveObject(objeto: any, collectionName: string): Promise<string> {
    try {
      const collectionRef = collection(
        this.firestore,
        collectionName
      ) as CollectionReference;

      let docId: string;

      if (!objeto.id) {
        // Usa addDoc para crear el documento y obtener el uid generado
        const docRef = await addDoc(collectionRef, objeto);
        docId = docRef.id;

        // Actualiza el campo `id` en el documento
        await updateDoc(docRef, { id: docId });
      } else {
        // Si el objeto ya tiene un ID, usa setDoc para actualizarlo
        const docRef = doc(collectionRef, objeto.id);
        await setDoc(docRef, objeto);
        docId = objeto.id;
      }

      // Mostrar mensajes de éxito dependiendo de la colección
      // const posicionToast = collectionName === 'pedidos' ? 'top' : 'middle';
      // this.toast.showExito(
      //   `Se guardó un registro en la colección: ${collectionName}`,
      //   posicionToast
      // );

      return docId; // Devuelve el ID del documento
    } catch (error) {
      this.toast.showError(
        `Error al guardar el objeto en la colección ${collectionName}`,
        'middle'
      );
      throw error;
    }
  }

  //Promesa para obtener datos de una coalección
  async getCollectionData(collectionName: string): Promise<any[]> {
    const collectionRef = collection(this.firestore, collectionName);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  suscribirseAColeccion(collectionName: string): void {
    // Verificar si ya existe un BehaviorSubject para la colección
    if (!this.collectionSubjects[collectionName]) {
      this.collectionSubjects[collectionName] = new BehaviorSubject<any[]>([]);
    }

    const collectionRef = collection(this.firestore, collectionName);

    onSnapshot(collectionRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      this.collectionSubjects[collectionName].next(data);
    });
  }

  getObservableDeColeccion(collectionName: string): Observable<any[]> {
    // Asegurar que exista el BehaviorSubject para la colección
    if (!this.collectionSubjects[collectionName]) {
      this.collectionSubjects[collectionName] = new BehaviorSubject<any[]>([]);
    }
    return this.collectionSubjects[collectionName].asObservable();
  }

  detenerSuscripcionDeColeccion(collectionName: string): void {
    if (this.collectionSubjects[collectionName]) {
      this.collectionSubjects[collectionName].complete();
      delete this.collectionSubjects[collectionName];
    }
  }

  //Verifica que el cliente esté en la lista de espera y que tenga el estado pendiente.
  async asignarMesa(numeroMesa: number, idCliente: string): Promise<void> {
    try {
      if (numeroMesa === undefined || numeroMesa === null) {
        throw new Error('El número de mesa no puede ser undefined o null.');
      }

      const clienteRef = doc(this.firestore, `listaDeEspera/${idCliente}`);
      const clienteSnap = await getDoc(clienteRef);
      //console.log(clienteSnap.ref.id);
      if (!clienteSnap.exists()) {
        throw new Error('El cliente no está en la lista de espera.');
      }
      const usuarioRef = doc(this.firestore, `usuarios/${idCliente}`);
      const usuarioSnap = await getDoc(usuarioRef);
      console.log(usuarioSnap.ref.id);
      if (!usuarioSnap.exists()) {
        throw new Error('El cliente no está en la lista de espera.');
      }
      const usuarioData = usuarioSnap.data();
      console.log(usuarioData);
      if (usuarioData && usuarioData['estado'] !== 'enEspera') {
        throw new Error(
          'El cliente no está pendiente para ser asignado a una mesa.'
        );
      }

      // Consulta la mesa por el número de mesa
      const mesasRef = collection(this.firestore, 'mesas');
      const mesaQuery = query(mesasRef, where('numero', '==', numeroMesa));
      const mesaSnap = await getDocs(mesaQuery);

      if (mesaSnap.empty) {
        throw new Error(`No se encontró una mesa con el número ${numeroMesa}.`);
      }

      const mesaDoc = mesaSnap.docs[0];
      const mesaRef = mesaDoc.ref;

      await updateDoc(mesaRef, {
        idClienteAsignado: idCliente,
        estado: 'reservada',
      });
      await updateDoc(usuarioRef, { estado: 'puedeTomarMesa' });

      this.toast.showExito(
        `Mesa ${numeroMesa} asignada al cliente ${idCliente}`,
        'middle'
      );
    } catch (error) {
      this.toast.showError(`Error al asignar mesa: ${numeroMesa}`, 'middle');
      console.error(error);
      throw error;
    }
  }

  // Verifica si el cliente tiene acceso a la mesa usando el número de mesa
  async verificarAccesoAMesa(
    numeroMesa: number,
    idCliente: string
  ): Promise<boolean> {
    try {
      // Consulta la mesa por el número de mesa
      const mesasRef = collection(this.firestore, 'mesas');
      const mesaQuery = query(mesasRef, where('numero', '==', numeroMesa));
      const mesaSnap = await getDocs(mesaQuery);

      if (mesaSnap.empty) {
        throw new Error(`No se encontró una mesa con el número ${numeroMesa}.`);
      }

      const mesaDoc = mesaSnap.docs[0];
      const mesaData = mesaDoc.data();

      if (mesaData && mesaData['idClienteAsignado'] !== idCliente) {
        throw new Error('El cliente no está asignado a esta mesa.');
      }

      const clienteRef = doc(this.firestore, `listaDeEspera/${idCliente}`);
      const clienteSnap = await getDoc(clienteRef);

      if (!clienteSnap.exists()) {
        throw new Error('El cliente no está en la lista de espera.');
      }
      const usuarioRef = doc(this.firestore, `usuarios/${idCliente}`);
      const usuarioSnap = await getDoc(usuarioRef);

      if (!usuarioSnap.exists()) {
        throw new Error('El cliente no está en la lista de espera.');
      }
      const clienteData = usuarioSnap.data();
      if (clienteData && clienteData['estado'] !== 'puedeTomarMesa') {
        throw new Error('El cliente no está asignado a una mesa.');
      }

      this.toast.showExito(
        `El cliente ${idCliente} puede tomar la mesa ${numeroMesa}`,
        'middle'
      );
      return true;
    } catch (error) {
      this.toast.showError(
        `Error en el acceso a la mesa: ${numeroMesa}`,
        'middle'
      );
      throw error;
    }
  }

  async obtenerMesas(): Promise<Mesa[]> {
    const mesasRef = collection(this.firestore, 'mesas');
    const snapshot = await getDocs(mesasRef);

    // Mapear correctamente las propiedades del documento
    const mesas: Mesa[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Mesa, 'id'>; // Datos del documento
      return {
        id: doc.id, // ID del documento
        ...data, // Todas las propiedades del documento
      };
    });

    // Filtrar solo las mesas con estado 'Disponible'
    // return mesas.filter((mesa) => mesa.estado === 'Disponible');
    return mesas;
  }

  // Obtiene todos los clientes en la lista de espera
  async obtenerClientesEnEspera(): Promise<any[]> {
    const clientesRef = collection(this.firestore, 'listaDeEspera');
    const usuariosRef = collection(this.firestore, 'usuarios');

    // Obtener todos los clientes en lista de espera
    const listaDeEsperaSnapshot = await getDocs(clientesRef);
    const listaDeEspera = listaDeEsperaSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    // Obtener todos los usuarios
    const usuariosSnapshot = await getDocs(usuariosRef);
    const usuarios = usuariosSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Usuario[];

    // Filtrar los clientes en lista de espera que tienen estado "enEspera" en la tabla usuarios
    const clientesEnEspera = listaDeEspera.filter((cliente) => {
      const usuario = usuarios.find((u) => u.id === cliente.id);
      return usuario?.estado === 'enEspera';

    });

    return clientesEnEspera;
  }

  obtenerPedidoPorEstado(estado: string): Observable<Pedido[]> {
    const pedidosRef = collection(this.firestore, 'pedidos');
    const q = query(pedidosRef, where('estado', '==', estado));

    return collectionData(q, { idField: 'id' as string }) as Observable<
      Pedido[]
    >;
  }

  actualizarPedido(id: string, data: Partial<Pedido>): Promise<void> {
    const pedidoDoc = doc(this.firestore, `pedidos/${id}`);
    return updateDoc(pedidoDoc, data);
  }

  agregarPedido(data: Pedido): Promise<DocumentReference> {
    return addDoc(this.coleccion, data);
  }

  async derivarASector(idPedido: string, sector: string): Promise<void> {
    const pedidoRef = doc(this.firestore, 'pedidos', idPedido);
    try {
      await updateDoc(pedidoRef, { sector });
      console.log(`Pedido ${idPedido} derivado al sector ${sector}`);
    } catch (error) {
      console.error('Error al derivar al sector:', error);
    }
  }

  obtenerMesaPorCliente(
    clienteId: string
  ): Observable<{ clienteId: string; nroMesa: number } | null> {
    const mesasRef = collection(this.firestore, 'mesas');
    const q = query(mesasRef, where('clienteId', '==', clienteId));

    return collectionData(q, { idField: 'id' }).pipe(
      map((mesas: any[]) => (mesas.length > 0 ? mesas[0] : null)) // Obtiene la primera mesa asignada al cliente
    );
  }

  obtenerPedidoConMesaPorEstado(estado: string): Observable<Pedido[]> {
    const pedidosRef = collection(this.firestore, 'pedidos');
    const q = query(pedidosRef, where('estado', '==', estado));

    return collectionData(q, { idField: 'id' }) as Observable<Pedido[]>;
  }

  obtenerPedidoConMesa(clienteId: string, estado: string): Observable<any> {
    const pedidosRef = collection(this.firestore, 'pedidos');
    const qPedidos = query(pedidosRef, where('estado', '==', estado));

    return collectionData(qPedidos, { idField: 'id' }).pipe(
      switchMap((pedidos: any[]) => {
        if (pedidos.length === 0) {
          return []; // No hay pedidos
        }

        const pedido = pedidos[0];
        return this.obtenerMesaPorCliente(clienteId).pipe(
          map((mesa) => ({
            ...pedido,
            mesa: mesa ? mesa.nroMesa : 'Sin asignar',
          }))
        );
      })
    );
  }

  //Metodo para actualizar varios o un solo campo de un documento
  async updateCollectionObject(
    collectionName: string,
    docId: string,
    updateData: any
  ): Promise<void> {
    try {
      // Crear referencia al documento dentro de la colección especificada
      const docRef = doc(this.firestore, `${collectionName}/${docId}`);

      // Actualizar múltiples campos al mismo tiempo
      await updateDoc(docRef, updateData);
      console.log(
        `Documento ${docId} en la colección '${collectionName}' actualizado correctamente.`
      );
    } catch (error) {
      console.error(
        `Error al actualizar el documento ${docId} en la colección '${collectionName}':`,
        error
      );
      throw error;
    }
  }

  async updateObjectField(
    collectionName: string,
    docId: string,
    fieldName: string,
    fieldValue: any
  ): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${collectionName}/${docId}`);

      // Crea un objeto con el campo a actualizar
      const updateObject = {
        [fieldName]: fieldValue,
      };

      await updateDoc(docRef, updateObject);
      console.log(
        `Campo ${fieldName} del usuario ${docId} actualizado correctamente.`
      );
    } catch (error) {
      console.error(
        `Error al actualizar el campo ${fieldName} del usuario ${docId}:`,
        error
      );
      throw error;
    }
  }

  async updateObjectFieldSerializable(
    collectionName: string,
    docId: string,
    fieldName: string,
    fieldValue: any
  ): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${collectionName}/${docId}`);

      // Valida y serializa el campo si es necesario
      const serializableFieldValue =
        fieldValue instanceof Reserva
          ? fieldValue.toPlainObject()
          : Array.isArray(fieldValue)
          ? fieldValue.map((item) =>
              item instanceof Reserva ? item.toPlainObject() : item
            )
          : fieldValue;

      // Crea un objeto con el campo a actualizar
      const updateObject = {
        [fieldName]: serializableFieldValue,
      };

      await updateDoc(docRef, updateObject);
      console.log(
        `Campo ${fieldName} del documento ${docId} actualizado correctamente.`
      );
    } catch (error) {
      console.error(
        `Error al actualizar el campo ${fieldName} del documento ${docId}:`,
        error
      );
      throw error;
    }
  }

  async getDocumentsByTwoFieldsAndOrder(
    collectionName: string,
    field1: string,
    value1: any,
    field2: string,
    values2: string[],
    orderByField: string
  ) {
    const pedidosRef = collection(this.firestore, collectionName);

    // Crear una consulta con varios filtros y ordenación
    const q = query(
      pedidosRef,
      where(field1, '==', value1), // Filtra por clienteId
      where(field2, 'in', values2), // Filtra por estado ("en preparación" o "finalizado")
      orderBy(orderByField), // Ordena por fecha
      orderBy('estado') // Ordena por estado
    );

    const querySnapshot = await getDocs(q);
    const pedidos: any[] = [];
    querySnapshot.forEach((doc) => {
      pedidos.push({ id: doc.id, ...doc.data() });
    });

    return pedidos;
  }

  async getDocumentsByField(
    collectionName: string,
    fieldName: string,
    fieldValue: any
  ): Promise<any[]> {
    try {
      // Obtén la referencia a la colección pasada por parámetro
      const collectionRef = collection(this.firestore, collectionName);

      // Crea una consulta para buscar documentos donde el campo especificado tenga el valor proporcionado
      const queryByField = query(
        collectionRef,
        where(fieldName, '==', fieldValue)
      );

      // Ejecuta la consulta
      const querySnapshot = await getDocs(queryByField);

      // Si hay documentos, mapea los resultados a un array de objetos
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Incluye el ID del documento
        ...doc.data(), // Incluye los datos del documento
      }));

      console.log(
        documents.length > 0
          ? `Se encontraron ${documents.length} documentos en ${collectionName} con ${fieldName} = ${fieldValue}`
          : `No se encontró ningún documento en ${collectionName} con ${fieldName} = ${fieldValue}`
      );

      return documents;
    } catch (error) {
      console.error(
        `Error al buscar documentos en ${collectionName} con ${fieldName} = ${fieldValue}:`,
        error
      );
      return []; // En caso de error, retorna un array vacío
    }
  }

  //Obtiene solo un documento de una coleccion por Id
  async obtenerDocumentoPorId<T>(
    coleccion: string,
    id: string
  ): Promise<T | null> {
    try {
      // Crear referencia al documento
      const docRef = doc(this.firestore, `${coleccion}/${id}`);

      // Obtener el documento
      const docSnapshot = await getDoc(docRef);

      // Verificar si el documento existe y devolver los datos
      return docSnapshot.exists()
        ? ({ id: docSnapshot.id, ...docSnapshot.data() } as T)
        : null;
    } catch (error) {
      console.error(
        `Error al obtener el documento con ID ${id} de la colección ${coleccion}:`,
        error
      );
      return null;
    }
  }

  /**
   * Elimina un campo específico de un documento en la colección.
   * @param collectionName Nombre de la colección.
   * @param docId ID del documento.
   * @param fieldName Nombre del campo a eliminar.
   */
  async deleteObjectField(
    collectionName: string,
    docId: string,
    fieldName: string
  ): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${collectionName}/${docId}`);

      // Prepara el objeto de actualización para eliminar el campo
      const updateObject = {
        [fieldName]: deleteField(), // Indica que se debe eliminar el campo
      };

      await updateDoc(docRef, updateObject);
      console.log(
        `Campo ${fieldName} eliminado del documento ${docId} en la colección ${collectionName}`
      );
    } catch (error) {
      console.error(
        `Error al eliminar el campo ${fieldName} del documento ${docId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Elimina un elemento específico de un array dentro de un documento en la colección.
   * @param collectionName Nombre de la colección.
   * @param docId ID del documento.
   * @param arrayFieldName Nombre del campo array.
   * @param predicate Función que determina qué elemento eliminar.
   */
  async deleteArrayElement<T>(
    collectionName: string,
    docId: string,
    arrayFieldName: string,
    predicate: (item: T) => boolean
  ): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${collectionName}/${docId}`);

      // Obtiene el documento actual para leer el array
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const array = data ? data[arrayFieldName] : null;

        if (Array.isArray(array)) {
          // Filtra los elementos que no cumplen con el predicado
          const updatedArray = array.filter((item: T) => !predicate(item));

          // Actualiza el documento con el array modificado
          const updateObject = {
            [arrayFieldName]: updatedArray,
          };

          await updateDoc(docRef, updateObject);
          console.log(
            `Elemento eliminado del array ${arrayFieldName} en el documento ${docId}`
          );
        } else {
          console.warn(
            `El campo ${arrayFieldName} no es un array o no existe en el documento ${docId}.`
          );
        }
      } else {
        console.warn(
          `El documento ${docId} no existe en la colección ${collectionName}.`
        );
      }
    } catch (error) {
      console.error(
        `Error al eliminar elemento del array ${arrayFieldName} en el documento ${docId}:`,
        error
      );
      throw error;
    }
  }
}

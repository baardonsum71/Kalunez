import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fsLimit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/api/firebaseClient';

/**
 * Firestore data-access helpers — same shape as the old Base44 / Supabase
 * `listRows` / `filterRows` / `createRow` / `updateRow` / `deleteRow` / `subscribeRows` API.
 *
 * Collection names match former Postgres table names (profiles, tracks, …).
 */

function sortField(sort) {
  if (!sort) return null;
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  const column =
    field === 'created_date' ? 'created_at'
      : field === 'updated_date' ? 'updated_at'
        : field;
  return { column, desc };
}

function withDateAliases(row) {
  if (!row || typeof row !== 'object') return row;
  const created =
    row.created_at?.toDate?.()?.toISOString?.()
    || row.created_at
    || row.created_date;
  const updated =
    row.updated_at?.toDate?.()?.toISOString?.()
    || row.updated_at
    || row.updated_date;
  return {
    ...row,
    ...(created !== undefined ? { created_at: created, created_date: created } : {}),
    ...(updated !== undefined ? { updated_at: updated, updated_date: updated } : {}),
  };
}

function rowFromSnap(snap) {
  if (!snap.exists()) return null;
  return withDateAliases({ id: snap.id, ...snap.data() });
}

export async function listRows(table, sort, limit) {
  const constraints = [];
  const s = sortField(sort);
  if (s) constraints.push(orderBy(s.column, s.desc ? 'desc' : 'asc'));
  if (limit) constraints.push(fsLimit(limit));
  const q = constraints.length
    ? query(collection(db, table), ...constraints)
    : collection(db, table);
  const snap = await getDocs(q);
  return snap.docs.map((d) => withDateAliases({ id: d.id, ...d.data() }));
}

export async function filterRows(table, criteria = {}, sort, limit) {
  const constraints = [];
  for (const [key, value] of Object.entries(criteria || {})) {
    if (value === undefined) continue;
    constraints.push(where(key, '==', value));
  }
  const s = sortField(sort);
  if (s) constraints.push(orderBy(s.column, s.desc ? 'desc' : 'asc'));
  if (limit) constraints.push(fsLimit(limit));

  let q;
  try {
    q = constraints.length
      ? query(collection(db, table), ...constraints)
      : collection(db, table);
  } catch (err) {
    throw err;
  }

  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) => withDateAliases({ id: d.id, ...d.data() }));
  } catch (err) {
    // Composite index missing: fall back to equality filter only, sort in memory.
    if (String(err?.message || '').includes('index') && Object.keys(criteria || {}).length) {
      const eqOnly = Object.entries(criteria)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => where(k, '==', v));
      const snap = await getDocs(query(collection(db, table), ...eqOnly));
      let rows = snap.docs.map((d) => withDateAliases({ id: d.id, ...d.data() }));
      if (s) {
        rows = rows.sort((a, b) => {
          const av = a[s.column];
          const bv = b[s.column];
          if (av === bv) return 0;
          if (av == null) return 1;
          if (bv == null) return -1;
          const cmp = av > bv ? 1 : -1;
          return s.desc ? -cmp : cmp;
        });
      }
      if (limit) rows = rows.slice(0, limit);
      return rows;
    }
    throw err;
  }
}

export async function createRow(table, data) {
  const payload = {
    ...data,
    created_at: data.created_at || serverTimestamp(),
    updated_at: data.updated_at || serverTimestamp(),
  };
  // Prefer explicit id (e.g. profiles use auth uid).
  if (data.id) {
    const id = data.id;
    const { id: _omit, ...rest } = payload;
    await setDoc(doc(db, table, id), { ...rest, id }, { merge: true });
    const snap = await getDoc(doc(db, table, id));
    return rowFromSnap(snap);
  }
  const refDoc = await addDoc(collection(db, table), payload);
  const snap = await getDoc(refDoc);
  return rowFromSnap(snap);
}

export async function updateRow(table, id, data) {
  const payload = {
    ...data,
    updated_at: serverTimestamp(),
  };
  delete payload.id;
  await updateDoc(doc(db, table, id), payload);
  const snap = await getDoc(doc(db, table, id));
  return rowFromSnap(snap);
}

export async function deleteRow(table, id) {
  await deleteDoc(doc(db, table, id));
  return true;
}

/**
 * Live query. Callback receives `{ eventType, new: row, old: row }` shaped
 * loosely like the old Supabase realtime payload for chat/message UIs.
 */
export function subscribeRows(table, callback, filter) {
  const constraints = [];
  if (filter?.column) {
    constraints.push(where(filter.column, '==', filter.value));
  }
  const q = constraints.length
    ? query(collection(db, table), ...constraints)
    : collection(db, table);

  const unsub = onSnapshot(q, (snap) => {
    snap.docChanges().forEach((change) => {
      const row = withDateAliases({ id: change.doc.id, ...change.doc.data() });
      const eventType =
        change.type === 'added' ? 'INSERT'
          : change.type === 'modified' ? 'UPDATE'
            : 'DELETE';
      callback({
        eventType,
        new: change.type === 'removed' ? null : row,
        old: change.type === 'added' ? null : row,
        // Supabase-shaped aliases some components may read:
        event: eventType,
        newRecord: change.type === 'removed' ? null : row,
        oldRecord: change.type === 'added' ? null : row,
      });
    });
  });

  return unsub;
}

export async function uploadFile(bucket, file, pathPrefix = '') {
  const ext = file.name.split('.').pop();
  const path = `${bucket}/${pathPrefix}${crypto.randomUUID()}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, {
    cacheControl: '3600',
    contentType: file.type || undefined,
  });
  const file_url = await getDownloadURL(storageRef);
  return { file_url };
}

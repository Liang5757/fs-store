const path = require('path');
const fs = require('fs');
const writeSync = require('write-file-atomic').sync;
const { rm, emptyDirectory } = require('./utils');

const EMPTY_KEY_FOLDER_NAME = '__EMPTY_KEY_FOLDER_NAME__';

interface MetaKey {
  key: string,
  index: number,
  size: number,
}

type MetaKeyMap = {
  [propName: string]: MetaKey,
};

class MetaKey {
  constructor (key: string, index: number, size = 5000) {
    this.key = key;
    this.index = index;
    this.size = size;
  }
}

function _escapeKey (key: string | number) {
  if (key === '') {
    return EMPTY_KEY_FOLDER_NAME;
  } else {
    return `${key}`;
  }
}

class LocalStorage {
  private static instance: LocalStorage;
  private readonly maxSize!: number;
  private metaKeyMap!: MetaKeyMap;
  readonly location!: string;
  keys!: string[];
  bytesInUse!: number;
  length!: number;

  [propName: string]: any;

  constructor (location: string, maxSize: number = 5 * 1024 * 1024) {
    if (LocalStorage.instance) {
      return LocalStorage.instance;
    }

    this.metaKeyMap = Object.create(null);
    this.keys = [];
    this.location = path.resolve(location);
    this.maxSize = maxSize;
    this.bytesInUse = 0;
    this.length = 0;

    this.init();

    return LocalStorage.instance = this.setProxy();
  }

  private init () {
    try {
      if (!fs.existsSync(this.location)) {
        fs.mkdirSync(this.location);
      }
      const storeStat = this.getStat();
      if (storeStat && !storeStat.isDirectory()) {
        fs.rmSync(this.location);
        throw new Error('The location must be a directory path');
      }
      const keys = fs.readdirSync(this.location);
      keys.forEach((key: string, index: number) => {
        const decodedKey = decodeURIComponent(key);
        this.keys.push(decodedKey);
        const stat = this.getStat(key);
        this.metaKeyMap[decodedKey] = new MetaKey(key, index, stat.size);
        this.bytesInUse += stat.size;
      });
      this.length = keys.length;
    } catch (e) {
      throw e;
    }
  }

  private setProxy () {
    return new Proxy(this, {
      set<T> (target: LocalStorage, key: string, value: T) {
        if (key in target) {
          target[key] = value;
        } else {
          target.setItem(key, value);
        }
        return true;
      },
      get (target: LocalStorage, key: string) {
        if (key in target) {
          return target[key];
        }
        return target.getItem(key);
      }
    });
  }

  private getStat (key: string | number = '') {
    key = _escapeKey(key);
    const filename = path.join(this.location, encodeURIComponent(key));
    try {
      return fs.statSync(filename);
    } catch {
      return null;
    }
  }

  setItem<T> (key: string | number, value: T): void {
    key = _escapeKey(key);
    const encodedKey = encodeURIComponent(key).replace(/[!'()]/g, escape).replace(/\*/g, '%2A');
    const valueString = JSON.stringify(value);
    const valueStringLength = valueString.length;
    const metaKey = this.metaKeyMap[key];
    const oldLength = metaKey?.size || 0;
    const lengthChange = valueStringLength - oldLength;

    if (this.bytesInUse + lengthChange > this.maxSize) {
      throw new Error('Maximum size limit exceeded!');
    }
    const filename = path.join(this.location, encodedKey);
    writeSync(filename, valueString, { encoding: 'utf-8' });
    if (!metaKey) { // if the key is not exists before set
      this.metaKeyMap[key] = new MetaKey(encodedKey, this.keys.push(key) - 1, valueString.length);
      this.length += 1;
    }
    this.bytesInUse += lengthChange;
  }

  getItem (key: string | number) {
    key = _escapeKey(key);
    const metaKey = this.metaKeyMap[key];
    if (!!metaKey) {
      const filename = path.join(this.location, metaKey.key);
      return JSON.parse(fs.readFileSync(filename, 'utf-8'));
    }
    return null;
  }

  removeItem (key: string) {
    key = _escapeKey(key);
    const metaKey = this.metaKeyMap[key];
    if (metaKey) {
      delete this.metaKeyMap[key];
      this.length -= 1;
      this.bytesInUse -= metaKey.size || 0;
      this.keys.splice(metaKey.index, 1);
      for (const k in this.metaKeyMap) {
        const meta = this.metaKeyMap[k];
        if (meta.index > metaKey.index) {
          meta.index -= 1;
        }
      }
      rm(path.join(this.location, metaKey.key));
    }
  }

  key (n: number) {
    return this.keys[n] ?? null;
  }

  clear () {
    emptyDirectory(this.location);
    this.metaKeyMap = Object.create(null);
    this.keys = [];
    this.length = 0;
    this.bytesInUse = 0;
  }
}

export = LocalStorage;

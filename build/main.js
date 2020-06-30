"use strict";
/*
 * Created with @iobroker/create-adapter v1.26.0
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
// node --inspect-brk node_modules/ioBroker.boschindego/build/main.js --force --logs
// https://github.com/zazaz-de/iot-device-bosch-indego-controller/blob/master/PROTOCOL.md
const utils = require("@iobroker/adapter-core");
const axios_1 = require("axios");
const URL = "https://api.indego.iot.bosch-si.com/api/v1/";
const TIMEOUT = 30000;
let contextId;
let userId;
let alm_sn;
let currentStateCode = 0;
let refreshMode = 1;
let connected = false;
let stateCodes = [
    [0, 'Reading status'],
    [257, 'Charging'],
    [258, 'Docked'],
    [259, 'Docked - Software update'],
    [260, 'Docked - Charging'],
    [261, 'Docked'],
    [262, 'Docked - Loading map'],
    [263, 'Docked - Saving map'],
    [513, 'Mowing'],
    [514, 'Relocalising'],
    [515, 'Loading map'],
    [516, 'Learning lawn'],
    [517, 'Paused'],
    [518, 'Border cut'],
    [519, 'Idle in lawn'],
    [769, 'Returning to Dock'],
    [770, 'Returning to Dock'],
    [771, 'Returning to Dock - Battery low'],
    [772, 'Returning to dock - Calendar timeslot ended'],
    [773, 'Returning to dock - Battery temp range'],
    [774, 'Returning to dock'],
    [775, 'Returning to dock - Lawn complete'],
    [776, 'Returning to dock - Relocalising']
];
class Boschindego extends utils.Adapter {
    constructor(options = {}) {
        super(Object.assign(Object.assign({}, options), { name: 'boschindego' }));
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        // this.on('objectChange', this.onObjectChange.bind(this));
        // this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }
    /**
     * Is called when databases are connected and adapter received configuration.
     */
    onReady() {
        return __awaiter(this, void 0, void 0, function* () {
            // Initialize your adapter here
            // The adapters config (in the instance object everything under the attribute "native") is accessible via
            // this.config:
            //this.log.info('config username: ' + this.config.username);
            //this.log.info('config password: ' + this.config.password);
            this.connect(this.config.username, this.config.password);
            /*
            For every state in the system there has to be also an object of type state
            Here a simple template for a boolean variable named "testVariable"
            Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
            */
            yield this.setObjectNotExistsAsync('testVariable', {
                type: 'state',
                common: {
                    name: 'testVariable',
                    type: 'boolean',
                    role: 'indicator',
                    read: true,
                    write: true,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('state.state', {
                type: 'state',
                common: {
                    name: 'state',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('state.stateText', {
                type: 'state',
                common: {
                    name: 'stateText',
                    type: 'string',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('state.mowmode', {
                type: 'state',
                common: {
                    name: 'mowmode',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('state.xPos', {
                type: 'state',
                common: {
                    name: 'xPos',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('state.yPos', {
                type: 'state',
                common: {
                    name: 'yPos',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('state.runtime.total.operate', {
                type: 'state',
                common: {
                    name: 'operate',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('state.runtime.total.charge', {
                type: 'state',
                common: {
                    name: 'charge',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('state.runtime.session.operate', {
                type: 'state',
                common: {
                    name: 'operate',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('state.runtime.session.charge', {
                type: 'state',
                common: {
                    name: 'charge',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('state.xPos', {
                type: 'state',
                common: {
                    name: 'xPos',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('state.map_update_available', {
                type: 'state',
                common: {
                    name: 'map_update_available',
                    type: 'boolean',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('state.mapsvgcache_ts', {
                type: 'state',
                common: {
                    name: 'mapsvgcache_ts',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('state.svg_xPos', {
                type: 'state',
                common: {
                    name: 'svg_xPos',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('state.svg_yPos', {
                type: 'state',
                common: {
                    name: 'svg_yPos',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('state.config_change', {
                type: 'state',
                common: {
                    name: 'config_change',
                    type: 'boolean',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('state.mow_trig', {
                type: 'state',
                common: {
                    name: 'mow_trig',
                    type: 'boolean',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('state.mowed', {
                type: 'state',
                common: {
                    name: 'mowed',
                    type: 'number',
                    min: 0,
                    max: 100,
                    unit: '%',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('machine.alm_sn', {
                type: 'state',
                common: {
                    name: 'alm_sn',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('machine.service_counter', {
                type: 'state',
                common: {
                    name: 'service_counter',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('machine.needs_service', {
                type: 'state',
                common: {
                    name: 'needs_service',
                    type: 'boolean',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('machine.alm_mode', {
                type: 'state',
                common: {
                    name: 'alm_mode',
                    type: 'string',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('machine.bareToolnumber', {
                type: 'state',
                common: {
                    name: 'bareToolnumber',
                    type: 'string',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('machine.alm_firmware_version', {
                type: 'state',
                common: {
                    name: 'alm_firmware_version',
                    type: 'string',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('commands.mow', {
                type: 'state',
                common: {
                    name: 'mow',
                    type: 'boolean',
                    role: 'button',
                    read: false,
                    write: true,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('commands.goHome', {
                type: 'state',
                common: {
                    name: 'goHome',
                    type: 'boolean',
                    role: 'button',
                    read: false,
                    write: true,
                },
                native: {},
            });
            yield this.setObjectNotExistsAsync('commands.pause', {
                type: 'state',
                common: {
                    name: 'pause',
                    type: 'boolean',
                    role: 'button',
                    read: false,
                    write: true,
                },
                native: {},
            });
            // In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
            this.subscribeStates('commands.mow');
            this.subscribeStates('commands.pause');
            this.subscribeStates('commands.goHome');
            // You can also add a subscription for multiple states. The following line watches all states starting with "lights."
            // this.subscribeStates('lights.*');
            // Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
            // this.subscribeStates('*');
            /*
                setState examples
                you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
            */
            // the variable testVariable is set to true as command (ack=false)
            //await this.setStateAsync('testVariable', true);
            // same thing, but the value is flagged "ack"
            // ack should be always set to true if the value is received from or acknowledged from the target system
            //await this.setStateAsync('testVariable', { val: true, ack: true });
            // same thing, but the state is deleted after 30s (getState will return null afterwards)
            //await this.setStateAsync('testVariable', { val: true, ack: true, expire: 30 });
            // examples for the checkPassword/checkGroup functions
            let result = yield this.checkPasswordAsync('admin', 'iobroker');
            this.log.info('check user admin pw iobroker: ' + result);
            result = yield this.checkGroupAsync('admin', 'admin');
            this.log.info('check group user admin group admin: ' + result);
            setInterval(() => {
                if (connected && refreshMode == 1) {
                    console.log('tier 1');
                    this.state();
                }
            }, 20000);
            setInterval(() => {
                if (connected && refreshMode == 2) {
                    console.log('tier 2');
                    this.state();
                }
            }, 60000);
            setInterval(() => {
                if (connected && refreshMode == 3) {
                    console.log('tier 3');
                    this.state();
                }
            }, 300000);
        });
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    onUnload(callback) {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            // clearInterval(interval1);
            callback();
        }
        catch (e) {
            callback();
        }
    }
    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    // /**
    //  * Is called if a subscribed object changes
    //  */
    // private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
    // 	if (obj) {
    // 		// The object was changed
    // 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
    // 	} else {
    // 		// The object was deleted
    // 		this.log.info(`object ${id} deleted`);
    // 	}
    // }
    /**
     * Is called if a subscribed state changes
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
            if (id.search("mow")) {
                this.mow();
            }
            if (id.search("pause")) {
                this.pause();
            }
            if (id.search("goHome")) {
                this.goHome();
            }
        }
        else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }
    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.message" property to be set to true in io-package.json
    //  */
    // private onMessage(obj: ioBroker.Message): void {
    // 	if (typeof obj === 'object' && obj.message) {
    // 		if (obj.command === 'send') {
    // 			// e.g. send email or pushover or whatever
    // 			this.log.info('send command');
    // 			// Send response in callback if required
    // 			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
    // 		}
    // 	}
    // }
    connect(username, password) {
        this.log.info('connect');
        console.log('connect');
        const buff = Buffer.from(username + ":" + password, 'utf-8');
        const base64 = buff.toString('base64');
        axios_1.default({
            method: "POST",
            url: `${URL}authenticate`,
            headers: {
                'Authorization': `Basic ${base64}`,
                'Content-Type': 'application/json'
            },
            data: { device: '', os_type: 'Android', os_version: '4.0', dvc_manuf: 'unknown', dvc_type: 'unknown' }
        }).then(res => {
            this.log.info('connect ok');
            contextId = res.data.contextId;
            userId = res.data.userId;
            alm_sn = res.data.alm_sn;
            connected = true;
            this.state();
        }).catch(err => {
            this.log.error('connect error');
            console.log("error in request", err);
            connected = false;
        });
    }
    mow() {
        console.log("mow");
        axios_1.default({
            method: "PUT",
            url: `${URL}alms/${alm_sn}/state`,
            headers: {
                'x-im-context-id': `${contextId}`
            },
            data: { state: 'mow' }
        }).then(res => {
            console.log("mow res", res.data);
        }).catch(err => {
            console.log("error in mow request", err);
        });
    }
    ;
    goHome() {
        console.log("returnToDock");
        axios_1.default({
            method: "PUT",
            url: `${URL}alms/${alm_sn}/state`,
            headers: {
                'x-im-context-id': `${contextId}`
            },
            data: { state: 'returnToDock' }
        }).then(res => {
            console.log("returnToDock res", res.data);
        }).catch(err => {
            console.log("error in returnToDock request", err);
        });
    }
    ;
    pause() {
        console.log("pause");
        axios_1.default({
            method: "PUT",
            url: `${URL}alms/${alm_sn}/state`,
            headers: {
                'x-im-context-id': `${contextId}`
            },
            data: { state: 'pause' }
        }).then(res => {
            console.log("pause res", res.data);
        }).catch(err => {
            console.log("error in pause request", err);
        });
    }
    ;
    state() {
        console.log("state");
        axios_1.default({
            method: "GET",
            url: `${URL}alms/${alm_sn}/state`,
            headers: {
                'x-im-context-id': `${contextId}`
            }
        }).then((res) => __awaiter(this, void 0, void 0, function* () {
            yield this.setStateAsync('state.state', { val: res.data.state, ack: true });
            yield this.setStateAsync('state.map_update_available', { val: res.data.map_update_available, ack: true });
            yield this.setStateAsync('state.mowed', { val: res.data.mowed, ack: true });
            yield this.setStateAsync('state.mowmode', { val: res.data.mowmode, ack: true });
            yield this.setStateAsync('state.xPos', { val: res.data.xPos, ack: true });
            yield this.setStateAsync('state.yPos', { val: res.data.yPos, ack: true });
            yield this.setStateAsync('state.runtime.total.operate', { val: res.data.runtime.total.operate, ack: true });
            yield this.setStateAsync('state.runtime.total.charge', { val: res.data.runtime.total.charge, ack: true });
            yield this.setStateAsync('state.runtime.session.operate', { val: res.data.runtime.session.operate, ack: true });
            yield this.setStateAsync('state.runtime.session.charge', { val: res.data.runtime.session.charge, ack: true });
            yield this.setStateAsync('state.mapsvgcache_ts', { val: res.data.mapsvgcache_ts, ack: true });
            yield this.setStateAsync('state.svg_xPos', { val: res.data.svg_xPos, ack: true });
            yield this.setStateAsync('state.svg_yPos', { val: res.data.svg_yPos, ack: true });
            yield this.setStateAsync('state.config_change', { val: res.data.config_change, ack: true });
            yield this.setStateAsync('state.mow_trig', { val: res.data.mow_trig, ack: true });
            for (let state of stateCodes) {
                if (state[0] == res.data.state) {
                    yield this.setStateAsync('state.stateText', { val: state[1], ack: true });
                }
            }
            this.stateCodeChange(res.data.state);
        })).catch(err => {
            console.log("error in state request", err.response);
            if (err.response.status == 401) {
                connected = false;
                this.connect(this.config.username, this.config.password);
            }
        });
    }
    ;
    getMachine() {
        console.log("machine");
        axios_1.default({
            method: "GET",
            url: `${URL}alms/${alm_sn}`,
            headers: {
                'x-im-context-id': `${contextId}`
            }
        }).then((res) => __awaiter(this, void 0, void 0, function* () {
            yield this.setStateAsync('machine.alm_sn', { val: res.data.alm_sn, ack: true });
            yield this.setStateAsync('machine.alm_mode', { val: res.data.alm_mode, ack: true });
            yield this.setStateAsync('machine.service_counter', { val: res.data.service_counter, ack: true });
            yield this.setStateAsync('machine.needs_service', { val: res.data.needs_service, ack: true });
            yield this.setStateAsync('machine.bareToolnumber', { val: res.data.bareToolnumber, ack: true });
            yield this.setStateAsync('machine.alm_firmware_version', { val: res.data.alm_firmware_version, ack: true });
        })).catch(err => {
            console.log("error in machine request", err);
        });
    }
    ;
    stateCodeChange(state) {
        console.log(state);
        if (currentStateCode != state) {
            this.getMachine();
        }
        if (state == 258) {
            refreshMode = 2;
            let d = new Date();
            let n = d.getHours();
            if (n >= 22 || n <= 8) {
                refreshMode = 3;
            }
        }
        else {
            refreshMode = 1;
        }
        currentStateCode = state;
    }
}
if (module.parent) {
    // Export the constructor in compact mode
    module.exports = (options) => new Boschindego(options);
}
else {
    // otherwise start the instance directly
    (() => new Boschindego())();
}

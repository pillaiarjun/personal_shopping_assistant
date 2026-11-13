function tu(i, e) {
  return e.forEach(function(t) {
    t && typeof t != "string" && !Array.isArray(t) && Object.keys(t).forEach(function(n) {
      if (n !== "default" && !(n in i)) {
        var r = Object.getOwnPropertyDescriptor(t, n);
        Object.defineProperty(i, n, r.get ? r : { enumerable: !0, get: function() {
          return t[n];
        } });
      }
    });
  }), Object.freeze(i);
}
let bc = !0, yc = !0;
function On(i, e, t) {
  const n = i.match(e);
  return n && n.length >= t && parseFloat(n[t], 10);
}
function $t(i, e, t) {
  if (!i.RTCPeerConnection)
    return;
  if (!Object.getOwnPropertyDescriptor(EventTarget.prototype, "addEventListener").writable) {
    Ds("Unable to polyfill events");
    return;
  }
  const r = i.RTCPeerConnection.prototype, s = r.addEventListener;
  r.addEventListener = function(a, c) {
    if (a !== e)
      return s.apply(this, arguments);
    const d = (l) => {
      const u = t(l);
      u && (c.handleEvent ? c.handleEvent(u) : c(u));
    };
    return this._eventMap = this._eventMap || {}, this._eventMap[e] || (this._eventMap[e] = /* @__PURE__ */ new Map()), this._eventMap[e].set(c, d), s.apply(this, [a, d]);
  };
  const o = r.removeEventListener;
  r.removeEventListener = function(a, c) {
    if (a !== e || !this._eventMap || !this._eventMap[e])
      return o.apply(this, arguments);
    if (!this._eventMap[e].has(c))
      return o.apply(this, arguments);
    const d = this._eventMap[e].get(c);
    return this._eventMap[e].delete(c), this._eventMap[e].size === 0 && delete this._eventMap[e], Object.keys(this._eventMap).length === 0 && delete this._eventMap, o.apply(this, [a, d]);
  }, Object.defineProperty(r, "on" + e, {
    get() {
      return this["_on" + e];
    },
    set(a) {
      this["_on" + e] && (this.removeEventListener(e, this["_on" + e]), delete this["_on" + e]), a && this.addEventListener(e, this["_on" + e] = a);
    },
    enumerable: !0,
    configurable: !0
  });
}
function nu(i) {
  return typeof i != "boolean" ? new Error("Argument type: " + typeof i + ". Please use a boolean.") : (bc = i, i ? "adapter.js logging disabled" : "adapter.js logging enabled");
}
function iu(i) {
  return typeof i != "boolean" ? new Error("Argument type: " + typeof i + ". Please use a boolean.") : (yc = !i, "adapter.js deprecation warnings " + (i ? "disabled" : "enabled"));
}
function Ds() {
  if (typeof window == "object") {
    if (bc)
      return;
    typeof console < "u" && typeof console.log == "function" && console.log.apply(console, arguments);
  }
}
function Ns(i, e) {
  yc && console.warn(i + " is deprecated, please use " + e + " instead.");
}
function ru(i) {
  const e = {
    browser: null,
    version: null
  };
  if (typeof i > "u" || !i.navigator || !i.navigator.userAgent)
    return e.browser = "Not a browser.", e;
  const t = i.navigator;
  if (t.userAgentData && t.userAgentData.brands) {
    const n = t.userAgentData.brands.find((r) => r.brand === "Chromium");
    if (n) {
      const r = parseInt(n.version, 10);
      if (r >= 90)
        return {
          browser: "chrome",
          version: r
        };
    }
  }
  if (t.mozGetUserMedia)
    e.browser = "firefox", e.version = parseInt(On(t.userAgent, /Firefox\/(\d+)\./, 1));
  else if (t.webkitGetUserMedia || i.isSecureContext === !1 && i.webkitRTCPeerConnection)
    e.browser = "chrome", e.version = parseInt(On(t.userAgent, /Chrom(e|ium)\/(\d+)\./, 2)) || null;
  else if (i.RTCPeerConnection && t.userAgent.match(/AppleWebKit\/(\d+)\./))
    e.browser = "safari", e.version = parseInt(On(t.userAgent, /AppleWebKit\/(\d+)\./, 1)), e.supportsUnifiedPlan = i.RTCRtpTransceiver && "currentDirection" in i.RTCRtpTransceiver.prototype, e._safariVersion = On(t.userAgent, /Version\/(\d+(\.?\d+))/, 1);
  else
    return e.browser = "Not a supported browser.", e;
  return e;
}
function Oa(i) {
  return Object.prototype.toString.call(i) === "[object Object]";
}
function kc(i) {
  return Oa(i) ? Object.keys(i).reduce(function(e, t) {
    const n = Oa(i[t]), r = n ? kc(i[t]) : i[t], s = n && !Object.keys(r).length;
    return r === void 0 || s ? e : Object.assign(e, {
      [t]: r
    });
  }, {}) : i;
}
function Gr(i, e, t) {
  !e || t.has(e.id) || (t.set(e.id, e), Object.keys(e).forEach((n) => {
    n.endsWith("Id") ? Gr(i, i.get(e[n]), t) : n.endsWith("Ids") && e[n].forEach((r) => {
      Gr(i, i.get(r), t);
    });
  }));
}
function La(i, e, t) {
  const n = t ? "outbound-rtp" : "inbound-rtp", r = /* @__PURE__ */ new Map();
  if (e === null)
    return r;
  const s = [];
  return i.forEach((o) => {
    o.type === "track" && o.trackIdentifier === e.id && s.push(o);
  }), s.forEach((o) => {
    i.forEach((a) => {
      a.type === n && a.trackId === o.id && Gr(i, a, r);
    });
  }), r;
}
const Da = Ds;
function Tc(i, e) {
  if (e.version >= 64)
    return;
  const t = i && i.navigator;
  if (!t.mediaDevices)
    return;
  const n = function(a) {
    if (typeof a != "object" || a.mandatory || a.optional)
      return a;
    const c = {};
    return Object.keys(a).forEach((d) => {
      if (d === "require" || d === "advanced" || d === "mediaSource")
        return;
      const l = typeof a[d] == "object" ? a[d] : {
        ideal: a[d]
      };
      l.exact !== void 0 && typeof l.exact == "number" && (l.min = l.max = l.exact);
      const u = function(h, f) {
        return h ? h + f.charAt(0).toUpperCase() + f.slice(1) : f === "deviceId" ? "sourceId" : f;
      };
      if (l.ideal !== void 0) {
        c.optional = c.optional || [];
        let h = {};
        typeof l.ideal == "number" ? (h[u("min", d)] = l.ideal, c.optional.push(h), h = {}, h[u("max", d)] = l.ideal, c.optional.push(h)) : (h[u("", d)] = l.ideal, c.optional.push(h));
      }
      l.exact !== void 0 && typeof l.exact != "number" ? (c.mandatory = c.mandatory || {}, c.mandatory[u("", d)] = l.exact) : ["min", "max"].forEach((h) => {
        l[h] !== void 0 && (c.mandatory = c.mandatory || {}, c.mandatory[u(h, d)] = l[h]);
      });
    }), a.advanced && (c.optional = (c.optional || []).concat(a.advanced)), c;
  }, r = function(a, c) {
    if (e.version >= 61)
      return c(a);
    if (a = JSON.parse(JSON.stringify(a)), a && typeof a.audio == "object") {
      const d = function(l, u, h) {
        u in l && !(h in l) && (l[h] = l[u], delete l[u]);
      };
      a = JSON.parse(JSON.stringify(a)), d(a.audio, "autoGainControl", "googAutoGainControl"), d(a.audio, "noiseSuppression", "googNoiseSuppression"), a.audio = n(a.audio);
    }
    if (a && typeof a.video == "object") {
      let d = a.video.facingMode;
      d = d && (typeof d == "object" ? d : {
        ideal: d
      });
      const l = e.version < 66;
      if (d && (d.exact === "user" || d.exact === "environment" || d.ideal === "user" || d.ideal === "environment") && !(t.mediaDevices.getSupportedConstraints && t.mediaDevices.getSupportedConstraints().facingMode && !l)) {
        delete a.video.facingMode;
        let u;
        if (d.exact === "environment" || d.ideal === "environment" ? u = ["back", "rear"] : (d.exact === "user" || d.ideal === "user") && (u = ["front"]), u)
          return t.mediaDevices.enumerateDevices().then((h) => {
            h = h.filter((g) => g.kind === "videoinput");
            let f = h.find((g) => u.some((p) => g.label.toLowerCase().includes(p)));
            return !f && h.length && u.includes("back") && (f = h[h.length - 1]), f && (a.video.deviceId = d.exact ? {
              exact: f.deviceId
            } : {
              ideal: f.deviceId
            }), a.video = n(a.video), Da("chrome: " + JSON.stringify(a)), c(a);
          });
      }
      a.video = n(a.video);
    }
    return Da("chrome: " + JSON.stringify(a)), c(a);
  }, s = function(a) {
    return e.version >= 64 ? a : {
      name: {
        PermissionDeniedError: "NotAllowedError",
        PermissionDismissedError: "NotAllowedError",
        InvalidStateError: "NotAllowedError",
        DevicesNotFoundError: "NotFoundError",
        ConstraintNotSatisfiedError: "OverconstrainedError",
        TrackStartError: "NotReadableError",
        MediaDeviceFailedDueToShutdown: "NotAllowedError",
        MediaDeviceKillSwitchOn: "NotAllowedError",
        TabCaptureError: "AbortError",
        ScreenCaptureError: "AbortError",
        DeviceCaptureError: "AbortError"
      }[a.name] || a.name,
      message: a.message,
      constraint: a.constraint || a.constraintName,
      toString() {
        return this.name + (this.message && ": ") + this.message;
      }
    };
  }, o = function(a, c, d) {
    r(a, (l) => {
      t.webkitGetUserMedia(l, c, (u) => {
        d && d(s(u));
      });
    });
  };
  if (t.getUserMedia = o.bind(t), t.mediaDevices.getUserMedia) {
    const a = t.mediaDevices.getUserMedia.bind(t.mediaDevices);
    t.mediaDevices.getUserMedia = function(c) {
      return r(c, (d) => a(d).then((l) => {
        if (d.audio && !l.getAudioTracks().length || d.video && !l.getVideoTracks().length)
          throw l.getTracks().forEach((u) => {
            u.stop();
          }), new DOMException("", "NotFoundError");
        return l;
      }, (l) => Promise.reject(s(l))));
    };
  }
}
function Sc(i) {
  i.MediaStream = i.MediaStream || i.webkitMediaStream;
}
function Cc(i, e) {
  if (!(e.version > 102))
    if (typeof i == "object" && i.RTCPeerConnection && !("ontrack" in i.RTCPeerConnection.prototype)) {
      Object.defineProperty(i.RTCPeerConnection.prototype, "ontrack", {
        get() {
          return this._ontrack;
        },
        set(n) {
          this._ontrack && this.removeEventListener("track", this._ontrack), this.addEventListener("track", this._ontrack = n);
        },
        enumerable: !0,
        configurable: !0
      });
      const t = i.RTCPeerConnection.prototype.setRemoteDescription;
      i.RTCPeerConnection.prototype.setRemoteDescription = function() {
        return this._ontrackpoly || (this._ontrackpoly = (r) => {
          r.stream.addEventListener("addtrack", (s) => {
            let o;
            i.RTCPeerConnection.prototype.getReceivers ? o = this.getReceivers().find((c) => c.track && c.track.id === s.track.id) : o = {
              track: s.track
            };
            const a = new Event("track");
            a.track = s.track, a.receiver = o, a.transceiver = {
              receiver: o
            }, a.streams = [r.stream], this.dispatchEvent(a);
          }), r.stream.getTracks().forEach((s) => {
            let o;
            i.RTCPeerConnection.prototype.getReceivers ? o = this.getReceivers().find((c) => c.track && c.track.id === s.id) : o = {
              track: s
            };
            const a = new Event("track");
            a.track = s, a.receiver = o, a.transceiver = {
              receiver: o
            }, a.streams = [r.stream], this.dispatchEvent(a);
          });
        }, this.addEventListener("addstream", this._ontrackpoly)), t.apply(this, arguments);
      };
    } else
      $t(i, "track", (t) => (t.transceiver || Object.defineProperty(t, "transceiver", {
        value: {
          receiver: t.receiver
        }
      }), t));
}
function wc(i) {
  if (typeof i == "object" && i.RTCPeerConnection && !("getSenders" in i.RTCPeerConnection.prototype) && "createDTMFSender" in i.RTCPeerConnection.prototype) {
    const e = function(r, s) {
      return {
        track: s,
        get dtmf() {
          return this._dtmf === void 0 && (s.kind === "audio" ? this._dtmf = r.createDTMFSender(s) : this._dtmf = null), this._dtmf;
        },
        _pc: r
      };
    };
    if (!i.RTCPeerConnection.prototype.getSenders) {
      i.RTCPeerConnection.prototype.getSenders = function() {
        return this._senders = this._senders || [], this._senders.slice();
      };
      const r = i.RTCPeerConnection.prototype.addTrack;
      i.RTCPeerConnection.prototype.addTrack = function(a, c) {
        let d = r.apply(this, arguments);
        return d || (d = e(this, a), this._senders.push(d)), d;
      };
      const s = i.RTCPeerConnection.prototype.removeTrack;
      i.RTCPeerConnection.prototype.removeTrack = function(a) {
        s.apply(this, arguments);
        const c = this._senders.indexOf(a);
        c !== -1 && this._senders.splice(c, 1);
      };
    }
    const t = i.RTCPeerConnection.prototype.addStream;
    i.RTCPeerConnection.prototype.addStream = function(s) {
      this._senders = this._senders || [], t.apply(this, [s]), s.getTracks().forEach((o) => {
        this._senders.push(e(this, o));
      });
    };
    const n = i.RTCPeerConnection.prototype.removeStream;
    i.RTCPeerConnection.prototype.removeStream = function(s) {
      this._senders = this._senders || [], n.apply(this, [s]), s.getTracks().forEach((o) => {
        const a = this._senders.find((c) => c.track === o);
        a && this._senders.splice(this._senders.indexOf(a), 1);
      });
    };
  } else if (typeof i == "object" && i.RTCPeerConnection && "getSenders" in i.RTCPeerConnection.prototype && "createDTMFSender" in i.RTCPeerConnection.prototype && i.RTCRtpSender && !("dtmf" in i.RTCRtpSender.prototype)) {
    const e = i.RTCPeerConnection.prototype.getSenders;
    i.RTCPeerConnection.prototype.getSenders = function() {
      const n = e.apply(this, []);
      return n.forEach((r) => r._pc = this), n;
    }, Object.defineProperty(i.RTCRtpSender.prototype, "dtmf", {
      get() {
        return this._dtmf === void 0 && (this.track.kind === "audio" ? this._dtmf = this._pc.createDTMFSender(this.track) : this._dtmf = null), this._dtmf;
      }
    });
  }
}
function Ec(i, e) {
  if (e.version >= 67 || !(typeof i == "object" && i.RTCPeerConnection && i.RTCRtpSender && i.RTCRtpReceiver))
    return;
  if (!("getStats" in i.RTCRtpSender.prototype)) {
    const n = i.RTCPeerConnection.prototype.getSenders;
    n && (i.RTCPeerConnection.prototype.getSenders = function() {
      const o = n.apply(this, []);
      return o.forEach((a) => a._pc = this), o;
    });
    const r = i.RTCPeerConnection.prototype.addTrack;
    r && (i.RTCPeerConnection.prototype.addTrack = function() {
      const o = r.apply(this, arguments);
      return o._pc = this, o;
    }), i.RTCRtpSender.prototype.getStats = function() {
      const o = this;
      return this._pc.getStats().then((a) => (
        /* Note: this will include stats of all senders that
         *   send a track with the same id as sender.track as
         *   it is not possible to identify the RTCRtpSender.
         */
        La(a, o.track, !0)
      ));
    };
  }
  if (!("getStats" in i.RTCRtpReceiver.prototype)) {
    const n = i.RTCPeerConnection.prototype.getReceivers;
    n && (i.RTCPeerConnection.prototype.getReceivers = function() {
      const s = n.apply(this, []);
      return s.forEach((o) => o._pc = this), s;
    }), $t(i, "track", (r) => (r.receiver._pc = r.srcElement, r)), i.RTCRtpReceiver.prototype.getStats = function() {
      const s = this;
      return this._pc.getStats().then((o) => La(o, s.track, !1));
    };
  }
  if (!("getStats" in i.RTCRtpSender.prototype && "getStats" in i.RTCRtpReceiver.prototype))
    return;
  const t = i.RTCPeerConnection.prototype.getStats;
  i.RTCPeerConnection.prototype.getStats = function() {
    if (arguments.length > 0 && arguments[0] instanceof i.MediaStreamTrack) {
      const r = arguments[0];
      let s, o, a;
      return this.getSenders().forEach((c) => {
        c.track === r && (s ? a = !0 : s = c);
      }), this.getReceivers().forEach((c) => (c.track === r && (o ? a = !0 : o = c), c.track === r)), a || s && o ? Promise.reject(new DOMException("There are more than one sender or receiver for the track.", "InvalidAccessError")) : s ? s.getStats() : o ? o.getStats() : Promise.reject(new DOMException("There is no sender or receiver for the track.", "InvalidAccessError"));
    }
    return t.apply(this, arguments);
  };
}
function _c(i) {
  i.RTCPeerConnection.prototype.getLocalStreams = function() {
    return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, Object.keys(this._shimmedLocalStreams).map((o) => this._shimmedLocalStreams[o][0]);
  };
  const e = i.RTCPeerConnection.prototype.addTrack;
  i.RTCPeerConnection.prototype.addTrack = function(o, a) {
    if (!a)
      return e.apply(this, arguments);
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    const c = e.apply(this, arguments);
    return this._shimmedLocalStreams[a.id] ? this._shimmedLocalStreams[a.id].indexOf(c) === -1 && this._shimmedLocalStreams[a.id].push(c) : this._shimmedLocalStreams[a.id] = [a, c], c;
  };
  const t = i.RTCPeerConnection.prototype.addStream;
  i.RTCPeerConnection.prototype.addStream = function(o) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {}, o.getTracks().forEach((d) => {
      if (this.getSenders().find((u) => u.track === d))
        throw new DOMException("Track already exists.", "InvalidAccessError");
    });
    const a = this.getSenders();
    t.apply(this, arguments);
    const c = this.getSenders().filter((d) => a.indexOf(d) === -1);
    this._shimmedLocalStreams[o.id] = [o].concat(c);
  };
  const n = i.RTCPeerConnection.prototype.removeStream;
  i.RTCPeerConnection.prototype.removeStream = function(o) {
    return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, delete this._shimmedLocalStreams[o.id], n.apply(this, arguments);
  };
  const r = i.RTCPeerConnection.prototype.removeTrack;
  i.RTCPeerConnection.prototype.removeTrack = function(o) {
    return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, o && Object.keys(this._shimmedLocalStreams).forEach((a) => {
      const c = this._shimmedLocalStreams[a].indexOf(o);
      c !== -1 && this._shimmedLocalStreams[a].splice(c, 1), this._shimmedLocalStreams[a].length === 1 && delete this._shimmedLocalStreams[a];
    }), r.apply(this, arguments);
  };
}
function Pc(i, e) {
  if (!i.RTCPeerConnection)
    return;
  if (i.RTCPeerConnection.prototype.addTrack && e.version >= 65)
    return _c(i);
  const t = i.RTCPeerConnection.prototype.getLocalStreams;
  i.RTCPeerConnection.prototype.getLocalStreams = function() {
    const l = t.apply(this);
    return this._reverseStreams = this._reverseStreams || {}, l.map((u) => this._reverseStreams[u.id]);
  };
  const n = i.RTCPeerConnection.prototype.addStream;
  i.RTCPeerConnection.prototype.addStream = function(l) {
    if (this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {}, l.getTracks().forEach((u) => {
      if (this.getSenders().find((f) => f.track === u))
        throw new DOMException("Track already exists.", "InvalidAccessError");
    }), !this._reverseStreams[l.id]) {
      const u = new i.MediaStream(l.getTracks());
      this._streams[l.id] = u, this._reverseStreams[u.id] = l, l = u;
    }
    n.apply(this, [l]);
  };
  const r = i.RTCPeerConnection.prototype.removeStream;
  i.RTCPeerConnection.prototype.removeStream = function(l) {
    this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {}, r.apply(this, [this._streams[l.id] || l]), delete this._reverseStreams[this._streams[l.id] ? this._streams[l.id].id : l.id], delete this._streams[l.id];
  }, i.RTCPeerConnection.prototype.addTrack = function(l, u) {
    if (this.signalingState === "closed")
      throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
    const h = [].slice.call(arguments, 1);
    if (h.length !== 1 || !h[0].getTracks().find((p) => p === l))
      throw new DOMException("The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.", "NotSupportedError");
    if (this.getSenders().find((p) => p.track === l))
      throw new DOMException("Track already exists.", "InvalidAccessError");
    this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {};
    const g = this._streams[u.id];
    if (g)
      g.addTrack(l), Promise.resolve().then(() => {
        this.dispatchEvent(new Event("negotiationneeded"));
      });
    else {
      const p = new i.MediaStream([l]);
      this._streams[u.id] = p, this._reverseStreams[p.id] = u, this.addStream(p);
    }
    return this.getSenders().find((p) => p.track === l);
  };
  function s(d, l) {
    let u = l.sdp;
    return Object.keys(d._reverseStreams || []).forEach((h) => {
      const f = d._reverseStreams[h], g = d._streams[f.id];
      u = u.replace(new RegExp(g.id, "g"), f.id);
    }), new RTCSessionDescription({
      type: l.type,
      sdp: u
    });
  }
  function o(d, l) {
    let u = l.sdp;
    return Object.keys(d._reverseStreams || []).forEach((h) => {
      const f = d._reverseStreams[h], g = d._streams[f.id];
      u = u.replace(new RegExp(f.id, "g"), g.id);
    }), new RTCSessionDescription({
      type: l.type,
      sdp: u
    });
  }
  ["createOffer", "createAnswer"].forEach(function(d) {
    const l = i.RTCPeerConnection.prototype[d], u = {
      [d]() {
        const h = arguments;
        return arguments.length && typeof arguments[0] == "function" ? l.apply(this, [(g) => {
          const p = s(this, g);
          h[0].apply(null, [p]);
        }, (g) => {
          h[1] && h[1].apply(null, g);
        }, arguments[2]]) : l.apply(this, arguments).then((g) => s(this, g));
      }
    };
    i.RTCPeerConnection.prototype[d] = u[d];
  });
  const a = i.RTCPeerConnection.prototype.setLocalDescription;
  i.RTCPeerConnection.prototype.setLocalDescription = function() {
    return !arguments.length || !arguments[0].type ? a.apply(this, arguments) : (arguments[0] = o(this, arguments[0]), a.apply(this, arguments));
  };
  const c = Object.getOwnPropertyDescriptor(i.RTCPeerConnection.prototype, "localDescription");
  Object.defineProperty(i.RTCPeerConnection.prototype, "localDescription", {
    get() {
      const d = c.get.apply(this);
      return d.type === "" ? d : s(this, d);
    }
  }), i.RTCPeerConnection.prototype.removeTrack = function(l) {
    if (this.signalingState === "closed")
      throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
    if (!l._pc)
      throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.", "TypeError");
    if (!(l._pc === this))
      throw new DOMException("Sender was not created by this connection.", "InvalidAccessError");
    this._streams = this._streams || {};
    let h;
    Object.keys(this._streams).forEach((f) => {
      this._streams[f].getTracks().find((p) => l.track === p) && (h = this._streams[f]);
    }), h && (h.getTracks().length === 1 ? this.removeStream(this._reverseStreams[h.id]) : h.removeTrack(l.track), this.dispatchEvent(new Event("negotiationneeded")));
  };
}
function Jr(i, e) {
  !i.RTCPeerConnection && i.webkitRTCPeerConnection && (i.RTCPeerConnection = i.webkitRTCPeerConnection), i.RTCPeerConnection && e.version < 53 && ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(t) {
    const n = i.RTCPeerConnection.prototype[t], r = {
      [t]() {
        return arguments[0] = new (t === "addIceCandidate" ? i.RTCIceCandidate : i.RTCSessionDescription)(arguments[0]), n.apply(this, arguments);
      }
    };
    i.RTCPeerConnection.prototype[t] = r[t];
  });
}
function Rc(i, e) {
  e.version > 102 || $t(i, "negotiationneeded", (t) => {
    const n = t.target;
    if (!((e.version < 72 || n.getConfiguration && n.getConfiguration().sdpSemantics === "plan-b") && n.signalingState !== "stable"))
      return t;
  });
}
var Na = /* @__PURE__ */ Object.freeze({ __proto__: null, fixNegotiationNeeded: Rc, shimAddTrackRemoveTrack: Pc, shimAddTrackRemoveTrackWithNative: _c, shimGetSendersWithDtmf: wc, shimGetUserMedia: Tc, shimMediaStream: Sc, shimOnTrack: Cc, shimPeerConnection: Jr, shimSenderReceiverGetStats: Ec });
function Ic(i, e) {
  const t = i && i.navigator;
  if (!t.mediaDevices)
    return;
  const n = i && i.MediaStreamTrack;
  if (t.getUserMedia = function(r, s, o) {
    Ns("navigator.getUserMedia", "navigator.mediaDevices.getUserMedia"), t.mediaDevices.getUserMedia(r).then(s, o);
  }, !(e.version > 55 && "autoGainControl" in t.mediaDevices.getSupportedConstraints())) {
    const r = function(o, a, c) {
      a in o && !(c in o) && (o[c] = o[a], delete o[a]);
    }, s = t.mediaDevices.getUserMedia.bind(t.mediaDevices);
    if (t.mediaDevices.getUserMedia = function(o) {
      return typeof o == "object" && typeof o.audio == "object" && (o = JSON.parse(JSON.stringify(o)), r(o.audio, "autoGainControl", "mozAutoGainControl"), r(o.audio, "noiseSuppression", "mozNoiseSuppression")), s(o);
    }, n && n.prototype.getSettings) {
      const o = n.prototype.getSettings;
      n.prototype.getSettings = function() {
        const a = o.apply(this, arguments);
        return r(a, "mozAutoGainControl", "autoGainControl"), r(a, "mozNoiseSuppression", "noiseSuppression"), a;
      };
    }
    if (n && n.prototype.applyConstraints) {
      const o = n.prototype.applyConstraints;
      n.prototype.applyConstraints = function(a) {
        return this.kind === "audio" && typeof a == "object" && (a = JSON.parse(JSON.stringify(a)), r(a, "autoGainControl", "mozAutoGainControl"), r(a, "noiseSuppression", "mozNoiseSuppression")), o.apply(this, [a]);
      };
    }
  }
}
function su(i, e) {
  i.navigator.mediaDevices && (i.navigator.mediaDevices && "getDisplayMedia" in i.navigator.mediaDevices || (i.navigator.mediaDevices.getDisplayMedia = function(n) {
    if (!(n && n.video)) {
      const r = new DOMException("getDisplayMedia without video constraints is undefined");
      return r.name = "NotFoundError", r.code = 8, Promise.reject(r);
    }
    return n.video === !0 ? n.video = {
      mediaSource: e
    } : n.video.mediaSource = e, i.navigator.mediaDevices.getUserMedia(n);
  }));
}
function Ac(i) {
  typeof i == "object" && i.RTCTrackEvent && "receiver" in i.RTCTrackEvent.prototype && !("transceiver" in i.RTCTrackEvent.prototype) && Object.defineProperty(i.RTCTrackEvent.prototype, "transceiver", {
    get() {
      return {
        receiver: this.receiver
      };
    }
  });
}
function $r(i, e) {
  typeof i != "object" || !(i.RTCPeerConnection || i.mozRTCPeerConnection) || (!i.RTCPeerConnection && i.mozRTCPeerConnection && (i.RTCPeerConnection = i.mozRTCPeerConnection), e.version < 53 && ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(t) {
    const n = i.RTCPeerConnection.prototype[t], r = {
      [t]() {
        return arguments[0] = new (t === "addIceCandidate" ? i.RTCIceCandidate : i.RTCSessionDescription)(arguments[0]), n.apply(this, arguments);
      }
    };
    i.RTCPeerConnection.prototype[t] = r[t];
  }));
}
function xc(i, e) {
  if (typeof i != "object" || !(i.RTCPeerConnection || i.mozRTCPeerConnection) || e.version >= 151)
    return;
  const t = {
    inboundrtp: "inbound-rtp",
    outboundrtp: "outbound-rtp",
    candidatepair: "candidate-pair",
    localcandidate: "local-candidate",
    remotecandidate: "remote-candidate"
  }, n = i.RTCPeerConnection.prototype.getStats;
  i.RTCPeerConnection.prototype.getStats = function() {
    const s = Array.prototype.slice.call(arguments), o = s[0], a = s[1], c = s[2];
    return this.signalingState === "closed" ? Promise.resolve(/* @__PURE__ */ new Map()) : n.apply(this, [o || null]).then((d) => {
      if (e.version < 53 && !a)
        try {
          d.forEach((l) => {
            l.type = t[l.type] || l.type;
          });
        } catch (l) {
          if (l.name !== "TypeError")
            throw l;
          d.forEach((u, h) => {
            d.set(h, Object.assign({}, u, {
              type: t[u.type] || u.type
            }));
          });
        }
      return d;
    }).then(a, c);
  };
}
function Mc(i) {
  if (!(typeof i == "object" && i.RTCPeerConnection && i.RTCRtpSender) || i.RTCRtpSender && "getStats" in i.RTCRtpSender.prototype)
    return;
  const e = i.RTCPeerConnection.prototype.getSenders;
  e && (i.RTCPeerConnection.prototype.getSenders = function() {
    const r = e.apply(this, []);
    return r.forEach((s) => s._pc = this), r;
  });
  const t = i.RTCPeerConnection.prototype.addTrack;
  t && (i.RTCPeerConnection.prototype.addTrack = function() {
    const r = t.apply(this, arguments);
    return r._pc = this, r;
  }), i.RTCRtpSender.prototype.getStats = function() {
    return this.track ? this._pc.getStats(this.track) : Promise.resolve(/* @__PURE__ */ new Map());
  };
}
function Oc(i) {
  if (!(typeof i == "object" && i.RTCPeerConnection && i.RTCRtpSender) || i.RTCRtpSender && "getStats" in i.RTCRtpReceiver.prototype)
    return;
  const e = i.RTCPeerConnection.prototype.getReceivers;
  e && (i.RTCPeerConnection.prototype.getReceivers = function() {
    const n = e.apply(this, []);
    return n.forEach((r) => r._pc = this), n;
  }), $t(i, "track", (t) => (t.receiver._pc = t.srcElement, t)), i.RTCRtpReceiver.prototype.getStats = function() {
    return this._pc.getStats(this.track);
  };
}
function Lc(i) {
  !i.RTCPeerConnection || "removeStream" in i.RTCPeerConnection.prototype || (i.RTCPeerConnection.prototype.removeStream = function(t) {
    Ns("removeStream", "removeTrack"), this.getSenders().forEach((n) => {
      n.track && t.getTracks().includes(n.track) && this.removeTrack(n);
    });
  });
}
function Dc(i) {
  i.DataChannel && !i.RTCDataChannel && (i.RTCDataChannel = i.DataChannel);
}
function Nc(i, e) {
  if (!(typeof i == "object" && i.RTCPeerConnection) || e.version >= 110)
    return;
  const t = i.RTCPeerConnection.prototype.addTransceiver;
  t && (i.RTCPeerConnection.prototype.addTransceiver = function() {
    this.setParametersPromises = [];
    let r = arguments[1] && arguments[1].sendEncodings;
    r === void 0 && (r = []), r = [...r];
    const s = r.length > 0;
    s && r.forEach((a) => {
      if ("rid" in a && !/^[a-z0-9]{0,16}$/i.test(a.rid))
        throw new TypeError("Invalid RID value provided.");
      if ("scaleResolutionDownBy" in a && !(parseFloat(a.scaleResolutionDownBy) >= 1))
        throw new RangeError("scale_resolution_down_by must be >= 1.0");
      if ("maxFramerate" in a && !(parseFloat(a.maxFramerate) >= 0))
        throw new RangeError("max_framerate must be >= 0.0");
    });
    const o = t.apply(this, arguments);
    if (s) {
      const a = o.sender, c = a.getParameters();
      (!("encodings" in c) || // Avoid being fooled by patched getParameters() below.
      c.encodings.length === 1 && Object.keys(c.encodings[0]).length === 0) && (c.encodings = r, a.sendEncodings = r, this.setParametersPromises.push(a.setParameters(c).then(() => {
        delete a.sendEncodings;
      }).catch(() => {
        delete a.sendEncodings;
      })));
    }
    return o;
  });
}
function Uc(i, e) {
  if (!(typeof i == "object" && i.RTCRtpSender) || e.version >= 110)
    return;
  const t = i.RTCRtpSender.prototype.getParameters;
  t && (i.RTCRtpSender.prototype.getParameters = function() {
    const r = t.apply(this, arguments);
    return "encodings" in r || (r.encodings = [].concat(this.sendEncodings || [{}])), r;
  });
}
function Fc(i, e) {
  if (!(typeof i == "object" && i.RTCPeerConnection) || e.version >= 110)
    return;
  const t = i.RTCPeerConnection.prototype.createOffer;
  i.RTCPeerConnection.prototype.createOffer = function() {
    return this.setParametersPromises && this.setParametersPromises.length ? Promise.all(this.setParametersPromises).then(() => t.apply(this, arguments)).finally(() => {
      this.setParametersPromises = [];
    }) : t.apply(this, arguments);
  };
}
function Bc(i, e) {
  if (!(typeof i == "object" && i.RTCPeerConnection) || e.version >= 110)
    return;
  const t = i.RTCPeerConnection.prototype.createAnswer;
  i.RTCPeerConnection.prototype.createAnswer = function() {
    return this.setParametersPromises && this.setParametersPromises.length ? Promise.all(this.setParametersPromises).then(() => t.apply(this, arguments)).finally(() => {
      this.setParametersPromises = [];
    }) : t.apply(this, arguments);
  };
}
var Ua = /* @__PURE__ */ Object.freeze({ __proto__: null, shimAddTransceiver: Nc, shimCreateAnswer: Bc, shimCreateOffer: Fc, shimGetDisplayMedia: su, shimGetParameters: Uc, shimGetStats: xc, shimGetUserMedia: Ic, shimOnTrack: Ac, shimPeerConnection: $r, shimRTCDataChannel: Dc, shimReceiverGetStats: Oc, shimRemoveStream: Lc, shimSenderGetStats: Mc });
function jc(i) {
  if (!(typeof i != "object" || !i.RTCPeerConnection)) {
    if ("getLocalStreams" in i.RTCPeerConnection.prototype || (i.RTCPeerConnection.prototype.getLocalStreams = function() {
      return this._localStreams || (this._localStreams = []), this._localStreams;
    }), !("addStream" in i.RTCPeerConnection.prototype)) {
      const e = i.RTCPeerConnection.prototype.addTrack;
      i.RTCPeerConnection.prototype.addStream = function(n) {
        this._localStreams || (this._localStreams = []), this._localStreams.includes(n) || this._localStreams.push(n), n.getAudioTracks().forEach((r) => e.call(this, r, n)), n.getVideoTracks().forEach((r) => e.call(this, r, n));
      }, i.RTCPeerConnection.prototype.addTrack = function(n) {
        for (var r = arguments.length, s = new Array(r > 1 ? r - 1 : 0), o = 1; o < r; o++)
          s[o - 1] = arguments[o];
        return s && s.forEach((a) => {
          this._localStreams ? this._localStreams.includes(a) || this._localStreams.push(a) : this._localStreams = [a];
        }), e.apply(this, arguments);
      };
    }
    "removeStream" in i.RTCPeerConnection.prototype || (i.RTCPeerConnection.prototype.removeStream = function(t) {
      this._localStreams || (this._localStreams = []);
      const n = this._localStreams.indexOf(t);
      if (n === -1)
        return;
      this._localStreams.splice(n, 1);
      const r = t.getTracks();
      this.getSenders().forEach((s) => {
        r.includes(s.track) && this.removeTrack(s);
      });
    });
  }
}
function qc(i) {
  if (!(typeof i != "object" || !i.RTCPeerConnection) && ("getRemoteStreams" in i.RTCPeerConnection.prototype || (i.RTCPeerConnection.prototype.getRemoteStreams = function() {
    return this._remoteStreams ? this._remoteStreams : [];
  }), !("onaddstream" in i.RTCPeerConnection.prototype))) {
    Object.defineProperty(i.RTCPeerConnection.prototype, "onaddstream", {
      get() {
        return this._onaddstream;
      },
      set(t) {
        this._onaddstream && (this.removeEventListener("addstream", this._onaddstream), this.removeEventListener("track", this._onaddstreampoly)), this.addEventListener("addstream", this._onaddstream = t), this.addEventListener("track", this._onaddstreampoly = (n) => {
          n.streams.forEach((r) => {
            if (this._remoteStreams || (this._remoteStreams = []), this._remoteStreams.includes(r))
              return;
            this._remoteStreams.push(r);
            const s = new Event("addstream");
            s.stream = r, this.dispatchEvent(s);
          });
        });
      }
    });
    const e = i.RTCPeerConnection.prototype.setRemoteDescription;
    i.RTCPeerConnection.prototype.setRemoteDescription = function() {
      const n = this;
      return this._onaddstreampoly || this.addEventListener("track", this._onaddstreampoly = function(r) {
        r.streams.forEach((s) => {
          if (n._remoteStreams || (n._remoteStreams = []), n._remoteStreams.indexOf(s) >= 0)
            return;
          n._remoteStreams.push(s);
          const o = new Event("addstream");
          o.stream = s, n.dispatchEvent(o);
        });
      }), e.apply(n, arguments);
    };
  }
}
function Vc(i) {
  if (typeof i != "object" || !i.RTCPeerConnection)
    return;
  const e = i.RTCPeerConnection.prototype, t = e.createOffer, n = e.createAnswer, r = e.setLocalDescription, s = e.setRemoteDescription, o = e.addIceCandidate;
  e.createOffer = function(d, l) {
    const u = arguments.length >= 2 ? arguments[2] : arguments[0], h = t.apply(this, [u]);
    return l ? (h.then(d, l), Promise.resolve()) : h;
  }, e.createAnswer = function(d, l) {
    const u = arguments.length >= 2 ? arguments[2] : arguments[0], h = n.apply(this, [u]);
    return l ? (h.then(d, l), Promise.resolve()) : h;
  };
  let a = function(c, d, l) {
    const u = r.apply(this, [c]);
    return l ? (u.then(d, l), Promise.resolve()) : u;
  };
  e.setLocalDescription = a, a = function(c, d, l) {
    const u = s.apply(this, [c]);
    return l ? (u.then(d, l), Promise.resolve()) : u;
  }, e.setRemoteDescription = a, a = function(c, d, l) {
    const u = o.apply(this, [c]);
    return l ? (u.then(d, l), Promise.resolve()) : u;
  }, e.addIceCandidate = a;
}
function Wc(i) {
  const e = i && i.navigator;
  if (e.mediaDevices && e.mediaDevices.getUserMedia) {
    const t = e.mediaDevices, n = t.getUserMedia.bind(t);
    e.mediaDevices.getUserMedia = (r) => n(Hc(r));
  }
  !e.getUserMedia && e.mediaDevices && e.mediaDevices.getUserMedia && (e.getUserMedia = function(n, r, s) {
    e.mediaDevices.getUserMedia(n).then(r, s);
  }.bind(e));
}
function Hc(i) {
  return i && i.video !== void 0 ? Object.assign({}, i, {
    video: kc(i.video)
  }) : i;
}
function zc(i) {
  if (!i.RTCPeerConnection)
    return;
  const e = i.RTCPeerConnection;
  i.RTCPeerConnection = function(n, r) {
    if (n && n.iceServers) {
      const s = [];
      for (let o = 0; o < n.iceServers.length; o++) {
        let a = n.iceServers[o];
        a.urls === void 0 && a.url ? (Ns("RTCIceServer.url", "RTCIceServer.urls"), a = JSON.parse(JSON.stringify(a)), a.urls = a.url, delete a.url, s.push(a)) : s.push(n.iceServers[o]);
      }
      n.iceServers = s;
    }
    return new e(n, r);
  }, i.RTCPeerConnection.prototype = e.prototype, "generateCertificate" in e && Object.defineProperty(i.RTCPeerConnection, "generateCertificate", {
    get() {
      return e.generateCertificate;
    }
  });
}
function Kc(i) {
  typeof i == "object" && i.RTCTrackEvent && "receiver" in i.RTCTrackEvent.prototype && !("transceiver" in i.RTCTrackEvent.prototype) && Object.defineProperty(i.RTCTrackEvent.prototype, "transceiver", {
    get() {
      return {
        receiver: this.receiver
      };
    }
  });
}
function Gc(i) {
  const e = i.RTCPeerConnection.prototype.createOffer;
  i.RTCPeerConnection.prototype.createOffer = function(n) {
    if (n) {
      typeof n.offerToReceiveAudio < "u" && (n.offerToReceiveAudio = !!n.offerToReceiveAudio);
      const r = this.getTransceivers().find((o) => o.receiver.track.kind === "audio");
      n.offerToReceiveAudio === !1 && r ? r.direction === "sendrecv" ? r.setDirection ? r.setDirection("sendonly") : r.direction = "sendonly" : r.direction === "recvonly" && (r.setDirection ? r.setDirection("inactive") : r.direction = "inactive") : n.offerToReceiveAudio === !0 && !r && this.addTransceiver("audio", {
        direction: "recvonly"
      }), typeof n.offerToReceiveVideo < "u" && (n.offerToReceiveVideo = !!n.offerToReceiveVideo);
      const s = this.getTransceivers().find((o) => o.receiver.track.kind === "video");
      n.offerToReceiveVideo === !1 && s ? s.direction === "sendrecv" ? s.setDirection ? s.setDirection("sendonly") : s.direction = "sendonly" : s.direction === "recvonly" && (s.setDirection ? s.setDirection("inactive") : s.direction = "inactive") : n.offerToReceiveVideo === !0 && !s && this.addTransceiver("video", {
        direction: "recvonly"
      });
    }
    return e.apply(this, arguments);
  };
}
function Jc(i) {
  typeof i != "object" || i.AudioContext || (i.AudioContext = i.webkitAudioContext);
}
var Fa = /* @__PURE__ */ Object.freeze({ __proto__: null, shimAudioContext: Jc, shimCallbacksAPI: Vc, shimConstraints: Hc, shimCreateOfferLegacy: Gc, shimGetUserMedia: Wc, shimLocalStreamsAPI: jc, shimRTCIceServerUrls: zc, shimRemoteStreamsAPI: qc, shimTrackEventTransceiver: Kc });
function $c(i) {
  return i && i.__esModule && Object.prototype.hasOwnProperty.call(i, "default") ? i.default : i;
}
var fr = { exports: {} }, Ba;
function au() {
  return Ba || (Ba = 1, (function(i) {
    const e = {};
    e.generateIdentifier = function() {
      return Math.random().toString(36).substring(2, 12);
    }, e.localCName = e.generateIdentifier(), e.splitLines = function(t) {
      return t.trim().split(`
`).map((n) => n.trim());
    }, e.splitSections = function(t) {
      return t.split(`
m=`).map((r, s) => (s > 0 ? "m=" + r : r).trim() + `\r
`);
    }, e.getDescription = function(t) {
      const n = e.splitSections(t);
      return n && n[0];
    }, e.getMediaSections = function(t) {
      const n = e.splitSections(t);
      return n.shift(), n;
    }, e.matchPrefix = function(t, n) {
      return e.splitLines(t).filter((r) => r.indexOf(n) === 0);
    }, e.parseCandidate = function(t) {
      let n;
      t.indexOf("a=candidate:") === 0 ? n = t.substring(12).split(" ") : n = t.substring(10).split(" ");
      const r = {
        foundation: n[0],
        component: {
          1: "rtp",
          2: "rtcp"
        }[n[1]] || n[1],
        protocol: n[2].toLowerCase(),
        priority: parseInt(n[3], 10),
        ip: n[4],
        address: n[4],
        // address is an alias for ip.
        port: parseInt(n[5], 10),
        // skip parts[6] == 'typ'
        type: n[7]
      };
      for (let s = 8; s < n.length; s += 2)
        switch (n[s]) {
          case "raddr":
            r.relatedAddress = n[s + 1];
            break;
          case "rport":
            r.relatedPort = parseInt(n[s + 1], 10);
            break;
          case "tcptype":
            r.tcpType = n[s + 1];
            break;
          case "ufrag":
            r.ufrag = n[s + 1], r.usernameFragment = n[s + 1];
            break;
          default:
            r[n[s]] === void 0 && (r[n[s]] = n[s + 1]);
            break;
        }
      return r;
    }, e.writeCandidate = function(t) {
      const n = [];
      n.push(t.foundation);
      const r = t.component;
      r === "rtp" ? n.push(1) : r === "rtcp" ? n.push(2) : n.push(r), n.push(t.protocol.toUpperCase()), n.push(t.priority), n.push(t.address || t.ip), n.push(t.port);
      const s = t.type;
      return n.push("typ"), n.push(s), s !== "host" && t.relatedAddress && t.relatedPort !== void 0 && (n.push("raddr"), n.push(t.relatedAddress), n.push("rport"), n.push(t.relatedPort)), t.tcpType && t.protocol.toLowerCase() === "tcp" && (n.push("tcptype"), n.push(t.tcpType)), (t.usernameFragment || t.ufrag) && (n.push("ufrag"), n.push(t.usernameFragment || t.ufrag)), "candidate:" + n.join(" ");
    }, e.parseIceOptions = function(t) {
      return t.substring(14).split(" ");
    }, e.parseRtpMap = function(t) {
      let n = t.substring(9).split(" ");
      const r = {
        payloadType: parseInt(n.shift(), 10)
        // was: id
      };
      return n = n[0].split("/"), r.name = n[0], r.clockRate = parseInt(n[1], 10), r.channels = n.length === 3 ? parseInt(n[2], 10) : 1, r.numChannels = r.channels, r;
    }, e.writeRtpMap = function(t) {
      let n = t.payloadType;
      t.preferredPayloadType !== void 0 && (n = t.preferredPayloadType);
      const r = t.channels || t.numChannels || 1;
      return "a=rtpmap:" + n + " " + t.name + "/" + t.clockRate + (r !== 1 ? "/" + r : "") + `\r
`;
    }, e.parseExtmap = function(t) {
      const n = t.substring(9).split(" ");
      return {
        id: parseInt(n[0], 10),
        direction: n[0].indexOf("/") > 0 ? n[0].split("/")[1] : "sendrecv",
        uri: n[1],
        attributes: n.slice(2).join(" ")
      };
    }, e.writeExtmap = function(t) {
      return "a=extmap:" + (t.id || t.preferredId) + (t.direction && t.direction !== "sendrecv" ? "/" + t.direction : "") + " " + t.uri + (t.attributes ? " " + t.attributes : "") + `\r
`;
    }, e.parseFmtp = function(t) {
      const n = {};
      let r;
      const s = t.substring(t.indexOf(" ") + 1).split(";");
      for (let o = 0; o < s.length; o++)
        r = s[o].trim().split("="), n[r[0].trim()] = r[1];
      return n;
    }, e.writeFmtp = function(t) {
      let n = "", r = t.payloadType;
      if (t.preferredPayloadType !== void 0 && (r = t.preferredPayloadType), t.parameters && Object.keys(t.parameters).length) {
        const s = [];
        Object.keys(t.parameters).forEach((o) => {
          t.parameters[o] !== void 0 ? s.push(o + "=" + t.parameters[o]) : s.push(o);
        }), n += "a=fmtp:" + r + " " + s.join(";") + `\r
`;
      }
      return n;
    }, e.parseRtcpFb = function(t) {
      const n = t.substring(t.indexOf(" ") + 1).split(" ");
      return {
        type: n.shift(),
        parameter: n.join(" ")
      };
    }, e.writeRtcpFb = function(t) {
      let n = "", r = t.payloadType;
      return t.preferredPayloadType !== void 0 && (r = t.preferredPayloadType), t.rtcpFeedback && t.rtcpFeedback.length && t.rtcpFeedback.forEach((s) => {
        n += "a=rtcp-fb:" + r + " " + s.type + (s.parameter && s.parameter.length ? " " + s.parameter : "") + `\r
`;
      }), n;
    }, e.parseSsrcMedia = function(t) {
      const n = t.indexOf(" "), r = {
        ssrc: parseInt(t.substring(7, n), 10)
      }, s = t.indexOf(":", n);
      return s > -1 ? (r.attribute = t.substring(n + 1, s), r.value = t.substring(s + 1)) : r.attribute = t.substring(n + 1), r;
    }, e.parseSsrcGroup = function(t) {
      const n = t.substring(13).split(" ");
      return {
        semantics: n.shift(),
        ssrcs: n.map((r) => parseInt(r, 10))
      };
    }, e.getMid = function(t) {
      const n = e.matchPrefix(t, "a=mid:")[0];
      if (n)
        return n.substring(6);
    }, e.parseFingerprint = function(t) {
      const n = t.substring(14).split(" ");
      return {
        algorithm: n[0].toLowerCase(),
        // algorithm is case-sensitive in Edge.
        value: n[1].toUpperCase()
        // the definition is upper-case in RFC 4572.
      };
    }, e.getDtlsParameters = function(t, n) {
      return {
        role: "auto",
        fingerprints: e.matchPrefix(t + n, "a=fingerprint:").map(e.parseFingerprint)
      };
    }, e.writeDtlsParameters = function(t, n) {
      let r = "a=setup:" + n + `\r
`;
      return t.fingerprints.forEach((s) => {
        r += "a=fingerprint:" + s.algorithm + " " + s.value + `\r
`;
      }), r;
    }, e.parseCryptoLine = function(t) {
      const n = t.substring(9).split(" ");
      return {
        tag: parseInt(n[0], 10),
        cryptoSuite: n[1],
        keyParams: n[2],
        sessionParams: n.slice(3)
      };
    }, e.writeCryptoLine = function(t) {
      return "a=crypto:" + t.tag + " " + t.cryptoSuite + " " + (typeof t.keyParams == "object" ? e.writeCryptoKeyParams(t.keyParams) : t.keyParams) + (t.sessionParams ? " " + t.sessionParams.join(" ") : "") + `\r
`;
    }, e.parseCryptoKeyParams = function(t) {
      if (t.indexOf("inline:") !== 0)
        return null;
      const n = t.substring(7).split("|");
      return {
        keyMethod: "inline",
        keySalt: n[0],
        lifeTime: n[1],
        mkiValue: n[2] ? n[2].split(":")[0] : void 0,
        mkiLength: n[2] ? n[2].split(":")[1] : void 0
      };
    }, e.writeCryptoKeyParams = function(t) {
      return t.keyMethod + ":" + t.keySalt + (t.lifeTime ? "|" + t.lifeTime : "") + (t.mkiValue && t.mkiLength ? "|" + t.mkiValue + ":" + t.mkiLength : "");
    }, e.getCryptoParameters = function(t, n) {
      return e.matchPrefix(t + n, "a=crypto:").map(e.parseCryptoLine);
    }, e.getIceParameters = function(t, n) {
      const r = e.matchPrefix(t + n, "a=ice-ufrag:")[0], s = e.matchPrefix(t + n, "a=ice-pwd:")[0];
      return r && s ? {
        usernameFragment: r.substring(12),
        password: s.substring(10)
      } : null;
    }, e.writeIceParameters = function(t) {
      let n = "a=ice-ufrag:" + t.usernameFragment + `\r
a=ice-pwd:` + t.password + `\r
`;
      return t.iceLite && (n += `a=ice-lite\r
`), n;
    }, e.parseRtpParameters = function(t) {
      const n = {
        codecs: [],
        headerExtensions: [],
        fecMechanisms: [],
        rtcp: []
      }, s = e.splitLines(t)[0].split(" ");
      n.profile = s[2];
      for (let a = 3; a < s.length; a++) {
        const c = s[a], d = e.matchPrefix(t, "a=rtpmap:" + c + " ")[0];
        if (d) {
          const l = e.parseRtpMap(d), u = e.matchPrefix(t, "a=fmtp:" + c + " ");
          switch (l.parameters = u.length ? e.parseFmtp(u[0]) : {}, l.rtcpFeedback = e.matchPrefix(t, "a=rtcp-fb:" + c + " ").map(e.parseRtcpFb), n.codecs.push(l), l.name.toUpperCase()) {
            case "RED":
            case "ULPFEC":
              n.fecMechanisms.push(l.name.toUpperCase());
              break;
          }
        }
      }
      e.matchPrefix(t, "a=extmap:").forEach((a) => {
        n.headerExtensions.push(e.parseExtmap(a));
      });
      const o = e.matchPrefix(t, "a=rtcp-fb:* ").map(e.parseRtcpFb);
      return n.codecs.forEach((a) => {
        o.forEach((c) => {
          a.rtcpFeedback.find((l) => l.type === c.type && l.parameter === c.parameter) || a.rtcpFeedback.push(c);
        });
      }), n;
    }, e.writeRtpDescription = function(t, n) {
      let r = "";
      r += "m=" + t + " ", r += n.codecs.length > 0 ? "9" : "0", r += " " + (n.profile || "UDP/TLS/RTP/SAVPF") + " ", r += n.codecs.map((o) => o.preferredPayloadType !== void 0 ? o.preferredPayloadType : o.payloadType).join(" ") + `\r
`, r += `c=IN IP4 0.0.0.0\r
`, r += `a=rtcp:9 IN IP4 0.0.0.0\r
`, n.codecs.forEach((o) => {
        r += e.writeRtpMap(o), r += e.writeFmtp(o), r += e.writeRtcpFb(o);
      });
      let s = 0;
      return n.codecs.forEach((o) => {
        o.maxptime > s && (s = o.maxptime);
      }), s > 0 && (r += "a=maxptime:" + s + `\r
`), n.headerExtensions && n.headerExtensions.forEach((o) => {
        r += e.writeExtmap(o);
      }), r;
    }, e.parseRtpEncodingParameters = function(t) {
      const n = [], r = e.parseRtpParameters(t), s = r.fecMechanisms.indexOf("RED") !== -1, o = r.fecMechanisms.indexOf("ULPFEC") !== -1, a = e.matchPrefix(t, "a=ssrc:").map((h) => e.parseSsrcMedia(h)).filter((h) => h.attribute === "cname"), c = a.length > 0 && a[0].ssrc;
      let d;
      const l = e.matchPrefix(t, "a=ssrc-group:FID").map((h) => h.substring(17).split(" ").map((g) => parseInt(g, 10)));
      l.length > 0 && l[0].length > 1 && l[0][0] === c && (d = l[0][1]), r.codecs.forEach((h) => {
        if (h.name.toUpperCase() === "RTX" && h.parameters.apt) {
          let f = {
            ssrc: c,
            codecPayloadType: parseInt(h.parameters.apt, 10)
          };
          c && d && (f.rtx = {
            ssrc: d
          }), n.push(f), s && (f = JSON.parse(JSON.stringify(f)), f.fec = {
            ssrc: c,
            mechanism: o ? "red+ulpfec" : "red"
          }, n.push(f));
        }
      }), n.length === 0 && c && n.push({
        ssrc: c
      });
      let u = e.matchPrefix(t, "b=");
      return u.length && (u[0].indexOf("b=TIAS:") === 0 ? u = parseInt(u[0].substring(7), 10) : u[0].indexOf("b=AS:") === 0 ? u = parseInt(u[0].substring(5), 10) * 1e3 * 0.95 - 2e3 * 8 : u = void 0, n.forEach((h) => {
        h.maxBitrate = u;
      })), n;
    }, e.parseRtcpParameters = function(t) {
      const n = {}, r = e.matchPrefix(t, "a=ssrc:").map((a) => e.parseSsrcMedia(a)).filter((a) => a.attribute === "cname")[0];
      r && (n.cname = r.value, n.ssrc = r.ssrc);
      const s = e.matchPrefix(t, "a=rtcp-rsize");
      n.reducedSize = s.length > 0, n.compound = s.length === 0;
      const o = e.matchPrefix(t, "a=rtcp-mux");
      return n.mux = o.length > 0, n;
    }, e.writeRtcpParameters = function(t) {
      let n = "";
      return t.reducedSize && (n += `a=rtcp-rsize\r
`), t.mux && (n += `a=rtcp-mux\r
`), t.ssrc !== void 0 && t.cname && (n += "a=ssrc:" + t.ssrc + " cname:" + t.cname + `\r
`), n;
    }, e.parseMsid = function(t) {
      let n;
      const r = e.matchPrefix(t, "a=msid:");
      if (r.length === 1)
        return n = r[0].substring(7).split(" "), {
          stream: n[0],
          track: n[1]
        };
      const s = e.matchPrefix(t, "a=ssrc:").map((o) => e.parseSsrcMedia(o)).filter((o) => o.attribute === "msid");
      if (s.length > 0)
        return n = s[0].value.split(" "), {
          stream: n[0],
          track: n[1]
        };
    }, e.parseSctpDescription = function(t) {
      const n = e.parseMLine(t), r = e.matchPrefix(t, "a=max-message-size:");
      let s;
      r.length > 0 && (s = parseInt(r[0].substring(19), 10)), isNaN(s) && (s = 65536);
      const o = e.matchPrefix(t, "a=sctp-port:");
      if (o.length > 0)
        return {
          port: parseInt(o[0].substring(12), 10),
          protocol: n.fmt,
          maxMessageSize: s
        };
      const a = e.matchPrefix(t, "a=sctpmap:");
      if (a.length > 0) {
        const c = a[0].substring(10).split(" ");
        return {
          port: parseInt(c[0], 10),
          protocol: c[1],
          maxMessageSize: s
        };
      }
    }, e.writeSctpDescription = function(t, n) {
      let r = [];
      return t.protocol !== "DTLS/SCTP" ? r = ["m=" + t.kind + " 9 " + t.protocol + " " + n.protocol + `\r
`, `c=IN IP4 0.0.0.0\r
`, "a=sctp-port:" + n.port + `\r
`] : r = ["m=" + t.kind + " 9 " + t.protocol + " " + n.port + `\r
`, `c=IN IP4 0.0.0.0\r
`, "a=sctpmap:" + n.port + " " + n.protocol + ` 65535\r
`], n.maxMessageSize !== void 0 && r.push("a=max-message-size:" + n.maxMessageSize + `\r
`), r.join("");
    }, e.generateSessionId = function() {
      return Math.random().toString().substr(2, 22);
    }, e.writeSessionBoilerplate = function(t, n, r) {
      let s;
      const o = n !== void 0 ? n : 2;
      return t ? s = t : s = e.generateSessionId(), `v=0\r
o=` + (r || "thisisadapterortc") + " " + s + " " + o + ` IN IP4 127.0.0.1\r
s=-\r
t=0 0\r
`;
    }, e.getDirection = function(t, n) {
      const r = e.splitLines(t);
      for (let s = 0; s < r.length; s++)
        switch (r[s]) {
          case "a=sendrecv":
          case "a=sendonly":
          case "a=recvonly":
          case "a=inactive":
            return r[s].substring(2);
        }
      return n ? e.getDirection(n) : "sendrecv";
    }, e.getKind = function(t) {
      return e.splitLines(t)[0].split(" ")[0].substring(2);
    }, e.isRejected = function(t) {
      return t.split(" ", 2)[1] === "0";
    }, e.parseMLine = function(t) {
      const r = e.splitLines(t)[0].substring(2).split(" ");
      return {
        kind: r[0],
        port: parseInt(r[1], 10),
        protocol: r[2],
        fmt: r.slice(3).join(" ")
      };
    }, e.parseOLine = function(t) {
      const r = e.matchPrefix(t, "o=")[0].substring(2).split(" ");
      return {
        username: r[0],
        sessionId: r[1],
        sessionVersion: parseInt(r[2], 10),
        netType: r[3],
        addressType: r[4],
        address: r[5]
      };
    }, e.isValidSDP = function(t) {
      if (typeof t != "string" || t.length === 0)
        return !1;
      const n = e.splitLines(t);
      for (let r = 0; r < n.length; r++)
        if (n[r].length < 2 || n[r].charAt(1) !== "=")
          return !1;
      return !0;
    }, i.exports = e;
  })(fr)), fr.exports;
}
var Qc = au(), an = /* @__PURE__ */ $c(Qc), ou = /* @__PURE__ */ tu({ __proto__: null, default: an }, [Qc]);
function yi(i) {
  if (!i.RTCIceCandidate || i.RTCIceCandidate && "foundation" in i.RTCIceCandidate.prototype)
    return;
  const e = i.RTCIceCandidate;
  i.RTCIceCandidate = function(n) {
    if (typeof n == "object" && n.candidate && n.candidate.indexOf("a=") === 0 && (n = JSON.parse(JSON.stringify(n)), n.candidate = n.candidate.substring(2)), n.candidate && n.candidate.length) {
      const r = new e(n), s = an.parseCandidate(n.candidate);
      for (const o in s)
        o in r || Object.defineProperty(r, o, {
          value: s[o]
        });
      return r.toJSON = function() {
        return {
          candidate: r.candidate,
          sdpMid: r.sdpMid,
          sdpMLineIndex: r.sdpMLineIndex,
          usernameFragment: r.usernameFragment
        };
      }, r;
    }
    return new e(n);
  }, i.RTCIceCandidate.prototype = e.prototype, $t(i, "icecandidate", (t) => (t.candidate && Object.defineProperty(t, "candidate", {
    value: new i.RTCIceCandidate(t.candidate),
    writable: "false"
  }), t));
}
function Qr(i) {
  !i.RTCIceCandidate || i.RTCIceCandidate && "relayProtocol" in i.RTCIceCandidate.prototype || $t(i, "icecandidate", (e) => {
    if (e.candidate) {
      const t = an.parseCandidate(e.candidate.candidate);
      t.type === "relay" && (e.candidate.relayProtocol = {
        0: "tls",
        1: "tcp",
        2: "udp"
      }[t.priority >> 24]);
    }
    return e;
  });
}
function ki(i, e) {
  if (!i.RTCPeerConnection || e.browser === "chrome" && e.version > 102 || e.browser === "firefox" && e.version >= 113)
    return;
  "sctp" in i.RTCPeerConnection.prototype || Object.defineProperty(i.RTCPeerConnection.prototype, "sctp", {
    get() {
      return typeof this._sctp > "u" ? null : this._sctp;
    }
  });
  const t = function(a) {
    if (!a || !a.sdp)
      return !1;
    const c = an.splitSections(a.sdp);
    return c.shift(), c.some((d) => {
      const l = an.parseMLine(d);
      return l && l.kind === "application" && l.protocol.indexOf("SCTP") !== -1;
    });
  }, n = function(a) {
    const c = a.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
    if (c === null || c.length < 2)
      return -1;
    const d = parseInt(c[1], 10);
    return d !== d ? -1 : d;
  }, r = function(a) {
    let c = 65536;
    return e.browser === "firefox" && (e.version < 57 ? a === -1 ? c = 16384 : c = 2147483637 : e.version < 60 ? c = e.version === 57 ? 65535 : 65536 : c = 2147483637), c;
  }, s = function(a, c) {
    let d = 65536;
    e.browser === "firefox" && e.version === 57 && (d = 65535);
    const l = an.matchPrefix(a.sdp, "a=max-message-size:");
    return l.length > 0 ? d = parseInt(l[0].substring(19), 10) : e.browser === "firefox" && c !== -1 && (d = 2147483637), d;
  }, o = i.RTCPeerConnection.prototype.setRemoteDescription;
  i.RTCPeerConnection.prototype.setRemoteDescription = function() {
    if (this._sctp = null, e.browser === "chrome" && e.version >= 76 && this.getConfiguration().sdpSemantics === "plan-b" && Object.defineProperty(this, "sctp", {
      get() {
        return typeof this._sctp > "u" ? null : this._sctp;
      },
      enumerable: !0,
      configurable: !0
    }), t(arguments[0])) {
      const c = n(arguments[0]), d = r(c), l = s(arguments[0], c);
      let u;
      d === 0 && l === 0 ? u = Number.POSITIVE_INFINITY : d === 0 || l === 0 ? u = Math.max(d, l) : u = Math.min(d, l);
      const h = {};
      Object.defineProperty(h, "maxMessageSize", {
        get() {
          return u;
        }
      }), this._sctp = h;
    }
    return o.apply(this, arguments);
  };
}
function Ti(i, e) {
  if (!(i.RTCPeerConnection && "createDataChannel" in i.RTCPeerConnection.prototype) || e.browser === "chrome" && e.version >= 149 || e.browser === "firefox" && e.version > 60)
    return;
  function t(r, s) {
    const o = r.send;
    r.send = function() {
      const c = arguments[0], d = c.length || c.size || c.byteLength;
      if (r.readyState === "open" && s.sctp && d > s.sctp.maxMessageSize)
        throw new TypeError("Message too large (can send a maximum of " + s.sctp.maxMessageSize + " bytes)");
      return o.apply(r, arguments);
    };
  }
  const n = i.RTCPeerConnection.prototype.createDataChannel;
  i.RTCPeerConnection.prototype.createDataChannel = function() {
    const s = n.apply(this, arguments);
    return t(s, this), s;
  }, $t(i, "datachannel", (r) => (t(r.channel, r.target), r));
}
function Yr(i) {
  if (!i.RTCPeerConnection || "connectionState" in i.RTCPeerConnection.prototype)
    return;
  const e = i.RTCPeerConnection.prototype;
  Object.defineProperty(e, "connectionState", {
    get() {
      return {
        completed: "connected",
        checking: "connecting"
      }[this.iceConnectionState] || this.iceConnectionState;
    },
    enumerable: !0,
    configurable: !0
  }), Object.defineProperty(e, "onconnectionstatechange", {
    get() {
      return this._onconnectionstatechange || null;
    },
    set(t) {
      this._onconnectionstatechange && (this.removeEventListener("connectionstatechange", this._onconnectionstatechange), delete this._onconnectionstatechange), t && this.addEventListener("connectionstatechange", this._onconnectionstatechange = t);
    },
    enumerable: !0,
    configurable: !0
  }), ["setLocalDescription", "setRemoteDescription"].forEach((t) => {
    const n = e[t];
    e[t] = function() {
      return this._connectionstatechangepoly || (this._connectionstatechangepoly = (r) => {
        const s = r.target;
        if (s._lastConnectionState !== s.connectionState) {
          s._lastConnectionState = s.connectionState;
          const o = new Event("connectionstatechange", r);
          s.dispatchEvent(o);
        }
        return r;
      }, this.addEventListener("iceconnectionstatechange", this._connectionstatechangepoly)), n.apply(this, arguments);
    };
  });
}
function Xr(i, e) {
  if (!i.RTCPeerConnection || e.browser === "chrome" && e.version >= 71 || e.browser === "safari" && e._safariVersion >= 13.1)
    return;
  const t = i.RTCPeerConnection.prototype.setRemoteDescription;
  i.RTCPeerConnection.prototype.setRemoteDescription = function(r) {
    if (r && r.sdp && r.sdp.indexOf(`
a=extmap-allow-mixed`) !== -1) {
      const s = r.sdp.split(`
`).filter((o) => o.trim() !== "a=extmap-allow-mixed").join(`
`);
      i.RTCSessionDescription && r instanceof i.RTCSessionDescription ? arguments[0] = new i.RTCSessionDescription({
        type: r.type,
        sdp: s
      }) : r.sdp = s;
    }
    return t.apply(this, arguments);
  };
}
function Si(i, e) {
  if (!(i.RTCPeerConnection && i.RTCPeerConnection.prototype))
    return;
  const t = i.RTCPeerConnection.prototype.addIceCandidate;
  !t || t.length === 0 || (i.RTCPeerConnection.prototype.addIceCandidate = function() {
    return arguments[0] ? (e.browser === "chrome" && e.version < 78 || e.browser === "firefox" && e.version < 68 || e.browser === "safari") && arguments[0] && arguments[0].candidate === "" ? Promise.resolve() : t.apply(this, arguments) : (arguments[1] && arguments[1].apply(null), Promise.resolve());
  });
}
function Ci(i, e) {
  if (!(i.RTCPeerConnection && i.RTCPeerConnection.prototype))
    return;
  const t = i.RTCPeerConnection.prototype.setLocalDescription;
  !t || t.length === 0 || (i.RTCPeerConnection.prototype.setLocalDescription = function() {
    let r = arguments[0] || {};
    if (typeof r != "object" || r.type && r.sdp)
      return t.apply(this, arguments);
    if (r = {
      type: r.type,
      sdp: r.sdp
    }, !r.type)
      switch (this.signalingState) {
        case "stable":
        case "have-local-offer":
        case "have-remote-pranswer":
          r.type = "offer";
          break;
        default:
          r.type = "answer";
          break;
      }
    return r.sdp || r.type !== "offer" && r.type !== "answer" ? t.apply(this, [r]) : (r.type === "offer" ? this.createOffer : this.createAnswer).apply(this).then((o) => t.apply(this, [o]));
  });
}
var cu = /* @__PURE__ */ Object.freeze({ __proto__: null, removeExtmapAllowMixed: Xr, shimAddIceCandidateNullOrEmpty: Si, shimConnectionState: Yr, shimMaxMessageSize: ki, shimParameterlessSetLocalDescription: Ci, shimRTCIceCandidate: yi, shimRTCIceCandidateRelayProtocol: Qr, shimSendThrowTypeError: Ti });
function du() {
  let i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, e = i.window, t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
    shimChrome: !0,
    shimFirefox: !0,
    shimSafari: !0
  };
  const n = Ds, r = ru(e), s = {
    browserDetails: r,
    commonShim: cu,
    extractVersion: On,
    disableLog: nu,
    disableWarnings: iu,
    // Expose sdp as a convenience. For production apps include directly.
    sdp: ou
  };
  switch (r.browser) {
    case "chrome":
      if (!Na || !Jr || !t.shimChrome)
        return n("Chrome shim is not included in this adapter release."), s;
      if (r.version === null)
        return n("Chrome shim can not determine version, not shimming."), s;
      n("adapter.js shimming chrome."), s.browserShim = Na, Si(e, r), Ci(e), Tc(e, r), Sc(e), Jr(e, r), Cc(e, r), Pc(e, r), wc(e), Ec(e, r), Rc(e, r), yi(e), Qr(e), Yr(e), ki(e, r), Ti(e, r), Xr(e, r);
      break;
    case "firefox":
      if (!Ua || !$r || !t.shimFirefox)
        return n("Firefox shim is not included in this adapter release."), s;
      n("adapter.js shimming firefox."), s.browserShim = Ua, Si(e, r), Ci(e), Ic(e, r), $r(e, r), xc(e, r), Ac(e), Lc(e), Mc(e), Oc(e), Dc(e), Nc(e, r), Uc(e, r), Fc(e, r), Bc(e, r), yi(e), Yr(e), ki(e, r), Ti(e, r);
      break;
    case "safari":
      if (!Fa || !t.shimSafari)
        return n("Safari shim is not included in this adapter release."), s;
      n("adapter.js shimming safari."), s.browserShim = Fa, Si(e, r), Ci(e), zc(e), Gc(e), Vc(e), jc(e), qc(e), Kc(e), Wc(e), Jc(e), yi(e), Qr(e), ki(e, r), Ti(e, r), Xr(e, r);
      break;
    default:
      n("Unsupported browser!");
      break;
  }
  return s;
}
du({
  window: typeof window > "u" ? void 0 : window
});
class Q {
  constructor(e, t, n, r, s) {
    if (typeof e == "object")
      this.width = e.width, this.height = e.height, this.aspectRatio = e.aspectRatio, this.encoding = {
        maxBitrate: e.maxBitrate,
        maxFramerate: e.maxFramerate,
        priority: e.priority
      };
    else if (t !== void 0 && n !== void 0)
      this.width = e, this.height = t, this.aspectRatio = e / t, this.encoding = {
        maxBitrate: n,
        maxFramerate: r,
        priority: s
      };
    else
      throw new TypeError("Unsupported options: provide at least width, height and maxBitrate");
  }
  get resolution() {
    return {
      width: this.width,
      height: this.height,
      frameRate: this.encoding.maxFramerate,
      aspectRatio: this.aspectRatio
    };
  }
}
const lu = ["vp8", "h264"], uu = ["vp8", "h264", "vp9", "av1", "h265"];
function Yc(i) {
  return !!lu.find((e) => e === i);
}
var ja;
(function(i) {
  i[i.PREFER_REGRESSION = 0] = "PREFER_REGRESSION", i[i.SIMULCAST = 1] = "SIMULCAST", i[i.REGRESSION = 2] = "REGRESSION";
})(ja || (ja = {}));
var Zr;
(function(i) {
  i.telephone = {
    maxBitrate: 12e3
  }, i.speech = {
    maxBitrate: 24e3
  }, i.music = {
    maxBitrate: 48e3
  }, i.musicStereo = {
    maxBitrate: 64e3
  }, i.musicHighQuality = {
    maxBitrate: 96e3
  }, i.musicHighQualityStereo = {
    maxBitrate: 128e3
  };
})(Zr || (Zr = {}));
const zn = {
  h90: /* @__PURE__ */ new Q(160, 90, 9e4, 20),
  h180: /* @__PURE__ */ new Q(320, 180, 16e4, 20),
  h216: /* @__PURE__ */ new Q(384, 216, 18e4, 20),
  h360: /* @__PURE__ */ new Q(640, 360, 45e4, 20),
  h540: /* @__PURE__ */ new Q(960, 540, 8e5, 25),
  h720: /* @__PURE__ */ new Q(1280, 720, 17e5, 30),
  h1080: /* @__PURE__ */ new Q(1920, 1080, 3e6, 30),
  h1440: /* @__PURE__ */ new Q(2560, 1440, 5e6, 30),
  h2160: /* @__PURE__ */ new Q(3840, 2160, 8e6, 30)
}, es = {
  h120: /* @__PURE__ */ new Q(160, 120, 7e4, 20),
  h180: /* @__PURE__ */ new Q(240, 180, 125e3, 20),
  h240: /* @__PURE__ */ new Q(320, 240, 14e4, 20),
  h360: /* @__PURE__ */ new Q(480, 360, 33e4, 20),
  h480: /* @__PURE__ */ new Q(640, 480, 5e5, 20),
  h540: /* @__PURE__ */ new Q(720, 540, 6e5, 25),
  h720: /* @__PURE__ */ new Q(960, 720, 13e5, 30),
  h1080: /* @__PURE__ */ new Q(1440, 1080, 23e5, 30),
  h1440: /* @__PURE__ */ new Q(1920, 1440, 38e5, 30)
}, Us = {
  h360fps3: /* @__PURE__ */ new Q(640, 360, 2e5, 3, "medium"),
  h360fps15: /* @__PURE__ */ new Q(640, 360, 4e5, 15, "medium"),
  h720fps5: /* @__PURE__ */ new Q(1280, 720, 8e5, 5, "medium"),
  h720fps15: /* @__PURE__ */ new Q(1280, 720, 15e5, 15, "medium"),
  h720fps30: /* @__PURE__ */ new Q(1280, 720, 2e6, 30, "medium"),
  h1080fps15: /* @__PURE__ */ new Q(1920, 1080, 25e5, 15, "medium"),
  h1080fps30: /* @__PURE__ */ new Q(1920, 1080, 5e6, 30, "medium"),
  // original resolution, without resizing
  original: /* @__PURE__ */ new Q(0, 0, 7e6, 30, "medium")
};
var hu = Object.defineProperty, fu = (i, e, t) => e in i ? hu(i, e, {
  enumerable: !0,
  configurable: !0,
  writable: !0,
  value: t
}) : i[e] = t, qa = (i, e, t) => fu(i, typeof e != "symbol" ? e + "" : e, t);
class fe {
  constructor() {
    qa(this, "_locking"), qa(this, "_locks"), this._locking = Promise.resolve(), this._locks = 0;
  }
  isLocked() {
    return this._locks > 0;
  }
  lock() {
    this._locks += 1;
    let e;
    const t = new Promise((r) => e = () => {
      this._locks -= 1, r();
    }), n = this._locking.then(() => e);
    return this._locking = this._locking.then(() => t), n;
  }
}
function ie(i, e) {
  if (!i)
    throw new Error(e);
}
const pu = 34028234663852886e22, mu = -34028234663852886e22, gu = 4294967295, vu = 2147483647, bu = -2147483648;
function wi(i) {
  if (typeof i != "number") throw new Error("invalid int 32: " + typeof i);
  if (!Number.isInteger(i) || i > vu || i < bu) throw new Error("invalid int 32: " + i);
}
function ts(i) {
  if (typeof i != "number") throw new Error("invalid uint 32: " + typeof i);
  if (!Number.isInteger(i) || i > gu || i < 0) throw new Error("invalid uint 32: " + i);
}
function Xc(i) {
  if (typeof i != "number") throw new Error("invalid float 32: " + typeof i);
  if (Number.isFinite(i) && (i > pu || i < mu))
    throw new Error("invalid float 32: " + i);
}
const Zc = /* @__PURE__ */ Symbol("@bufbuild/protobuf/enum-type");
function yu(i) {
  const e = i[Zc];
  return ie(e, "missing enum type on enum object"), e;
}
function ed(i, e, t, n) {
  i[Zc] = td(e, t.map((r) => ({
    no: r.no,
    name: r.name,
    localName: i[r.no]
  })));
}
function td(i, e, t) {
  const n = /* @__PURE__ */ Object.create(null), r = /* @__PURE__ */ Object.create(null), s = [];
  for (const o of e) {
    const a = nd(o);
    s.push(a), n[o.name] = a, r[o.no] = a;
  }
  return {
    typeName: i,
    values: s,
    // We do not surface options at this time
    // options: opt?.options ?? Object.create(null),
    findName(o) {
      return n[o];
    },
    findNumber(o) {
      return r[o];
    }
  };
}
function ku(i, e, t) {
  const n = {};
  for (const r of e) {
    const s = nd(r);
    n[s.localName] = s.no, n[s.no] = s.localName;
  }
  return ed(n, i, e), n;
}
function nd(i) {
  return "localName" in i ? i : Object.assign(Object.assign({}, i), {
    localName: i.name
  });
}
class Fs {
  /**
   * Compare with a message of the same type.
   * Note that this function disregards extensions and unknown fields.
   */
  equals(e) {
    return this.getType().runtime.util.equals(this.getType(), this, e);
  }
  /**
   * Create a deep copy.
   */
  clone() {
    return this.getType().runtime.util.clone(this);
  }
  /**
   * Parse from binary data, merging fields.
   *
   * Repeated fields are appended. Map entries are added, overwriting
   * existing keys.
   *
   * If a message field is already present, it will be merged with the
   * new data.
   */
  fromBinary(e, t) {
    const n = this.getType(), r = n.runtime.bin, s = r.makeReadOptions(t);
    return r.readMessage(this, s.readerFactory(e), e.byteLength, s), this;
  }
  /**
   * Parse a message from a JSON value.
   */
  fromJson(e, t) {
    const n = this.getType(), r = n.runtime.json, s = r.makeReadOptions(t);
    return r.readMessage(n, e, s, this), this;
  }
  /**
   * Parse a message from a JSON string.
   */
  fromJsonString(e, t) {
    let n;
    try {
      n = JSON.parse(e);
    } catch (r) {
      throw new Error("cannot decode ".concat(this.getType().typeName, " from JSON: ").concat(r instanceof Error ? r.message : String(r)));
    }
    return this.fromJson(n, t);
  }
  /**
   * Serialize the message to binary data.
   */
  toBinary(e) {
    const t = this.getType(), n = t.runtime.bin, r = n.makeWriteOptions(e), s = r.writerFactory();
    return n.writeMessage(this, s, r), s.finish();
  }
  /**
   * Serialize the message to a JSON value, a JavaScript value that can be
   * passed to JSON.stringify().
   */
  toJson(e) {
    const t = this.getType(), n = t.runtime.json, r = n.makeWriteOptions(e);
    return n.writeMessage(this, r);
  }
  /**
   * Serialize the message to a JSON string.
   */
  toJsonString(e) {
    var t;
    const n = this.toJson(e);
    return JSON.stringify(n, null, (t = e?.prettySpaces) !== null && t !== void 0 ? t : 0);
  }
  /**
   * Override for serialization behavior. This will be invoked when calling
   * JSON.stringify on this message (i.e. JSON.stringify(msg)).
   *
   * Note that this will not serialize google.protobuf.Any with a packed
   * message because the protobuf JSON format specifies that it needs to be
   * unpacked, and this is only possible with a type registry to look up the
   * message type.  As a result, attempting to serialize a message with this
   * type will throw an Error.
   *
   * This method is protected because you should not need to invoke it
   * directly -- instead use JSON.stringify or toJsonString for
   * stringified JSON.  Alternatively, if actual JSON is desired, you should
   * use toJson.
   */
  toJSON() {
    return this.toJson({
      emitDefaultValues: !0
    });
  }
  /**
   * Retrieve the MessageType of this message - a singleton that represents
   * the protobuf message declaration and provides metadata for reflection-
   * based operations.
   */
  getType() {
    return Object.getPrototypeOf(this).constructor;
  }
}
function Tu(i, e, t, n) {
  var r;
  const s = (r = n?.localName) !== null && r !== void 0 ? r : e.substring(e.lastIndexOf(".") + 1), o = {
    [s]: function(a) {
      i.util.initFields(this), i.util.initPartial(a, this);
    }
  }[s];
  return Object.setPrototypeOf(o.prototype, new Fs()), Object.assign(o, {
    runtime: i,
    typeName: e,
    fields: i.util.newFieldList(t),
    fromBinary(a, c) {
      return new o().fromBinary(a, c);
    },
    fromJson(a, c) {
      return new o().fromJson(a, c);
    },
    fromJsonString(a, c) {
      return new o().fromJsonString(a, c);
    },
    equals(a, c) {
      return i.util.equals(o, a, c);
    }
  }), o;
}
function Su() {
  let i = 0, e = 0;
  for (let n = 0; n < 28; n += 7) {
    let r = this.buf[this.pos++];
    if (i |= (r & 127) << n, (r & 128) == 0)
      return this.assertBounds(), [i, e];
  }
  let t = this.buf[this.pos++];
  if (i |= (t & 15) << 28, e = (t & 112) >> 4, (t & 128) == 0)
    return this.assertBounds(), [i, e];
  for (let n = 3; n <= 31; n += 7) {
    let r = this.buf[this.pos++];
    if (e |= (r & 127) << n, (r & 128) == 0)
      return this.assertBounds(), [i, e];
  }
  throw new Error("invalid varint");
}
function pr(i, e, t) {
  for (let s = 0; s < 28; s = s + 7) {
    const o = i >>> s, a = !(!(o >>> 7) && e == 0), c = (a ? o | 128 : o) & 255;
    if (t.push(c), !a)
      return;
  }
  const n = i >>> 28 & 15 | (e & 7) << 4, r = e >> 3 != 0;
  if (t.push((r ? n | 128 : n) & 255), !!r) {
    for (let s = 3; s < 31; s = s + 7) {
      const o = e >>> s, a = !!(o >>> 7), c = (a ? o | 128 : o) & 255;
      if (t.push(c), !a)
        return;
    }
    t.push(e >>> 31 & 1);
  }
}
const Ei = 4294967296;
function Va(i) {
  const e = i[0] === "-";
  e && (i = i.slice(1));
  const t = 1e6;
  let n = 0, r = 0;
  function s(o, a) {
    const c = Number(i.slice(o, a));
    r *= t, n = n * t + c, n >= Ei && (r = r + (n / Ei | 0), n = n % Ei);
  }
  return s(-24, -18), s(-18, -12), s(-12, -6), s(-6), e ? rd(n, r) : Bs(n, r);
}
function Cu(i, e) {
  let t = Bs(i, e);
  const n = t.hi & 2147483648;
  n && (t = rd(t.lo, t.hi));
  const r = id(t.lo, t.hi);
  return n ? "-" + r : r;
}
function id(i, e) {
  var t = wu(i, e);
  if (i = t.lo, e = t.hi, e <= 2097151)
    return String(Ei * e + i);
  const n = i & 16777215, r = (i >>> 24 | e << 8) & 16777215, s = e >> 16 & 65535;
  let o = n + r * 6777216 + s * 6710656, a = r + s * 8147497, c = s * 2;
  const d = 1e7;
  return o >= d && (a += Math.floor(o / d), o %= d), a >= d && (c += Math.floor(a / d), a %= d), c.toString() + Wa(a) + Wa(o);
}
function wu(i, e) {
  return {
    lo: i >>> 0,
    hi: e >>> 0
  };
}
function Bs(i, e) {
  return {
    lo: i | 0,
    hi: e | 0
  };
}
function rd(i, e) {
  return e = ~e, i ? i = ~i + 1 : e += 1, Bs(i, e);
}
const Wa = (i) => {
  const e = String(i);
  return "0000000".slice(e.length) + e;
};
function Ha(i, e) {
  if (i >= 0) {
    for (; i > 127; )
      e.push(i & 127 | 128), i = i >>> 7;
    e.push(i);
  } else {
    for (let t = 0; t < 9; t++)
      e.push(i & 127 | 128), i = i >> 7;
    e.push(1);
  }
}
function Eu() {
  let i = this.buf[this.pos++], e = i & 127;
  if ((i & 128) == 0)
    return this.assertBounds(), e;
  if (i = this.buf[this.pos++], e |= (i & 127) << 7, (i & 128) == 0)
    return this.assertBounds(), e;
  if (i = this.buf[this.pos++], e |= (i & 127) << 14, (i & 128) == 0)
    return this.assertBounds(), e;
  if (i = this.buf[this.pos++], e |= (i & 127) << 21, (i & 128) == 0)
    return this.assertBounds(), e;
  i = this.buf[this.pos++], e |= (i & 15) << 28;
  for (let t = 5; (i & 128) !== 0 && t < 10; t++) i = this.buf[this.pos++];
  if ((i & 128) != 0) throw new Error("invalid varint");
  return this.assertBounds(), e >>> 0;
}
function _u() {
  const i = new DataView(new ArrayBuffer(8));
  if (typeof BigInt == "function" && typeof i.getBigInt64 == "function" && typeof i.getBigUint64 == "function" && typeof i.setBigInt64 == "function" && typeof i.setBigUint64 == "function" && (typeof process != "object" || typeof process.env != "object" || process.env.BUF_BIGINT_DISABLE !== "1")) {
    const r = BigInt("-9223372036854775808"), s = BigInt("9223372036854775807"), o = BigInt("0"), a = BigInt("18446744073709551615");
    return {
      zero: BigInt(0),
      supported: !0,
      parse(c) {
        const d = typeof c == "bigint" ? c : BigInt(c);
        if (d > s || d < r)
          throw new Error("int64 invalid: ".concat(c));
        return d;
      },
      uParse(c) {
        const d = typeof c == "bigint" ? c : BigInt(c);
        if (d > a || d < o)
          throw new Error("uint64 invalid: ".concat(c));
        return d;
      },
      enc(c) {
        return i.setBigInt64(0, this.parse(c), !0), {
          lo: i.getInt32(0, !0),
          hi: i.getInt32(4, !0)
        };
      },
      uEnc(c) {
        return i.setBigInt64(0, this.uParse(c), !0), {
          lo: i.getInt32(0, !0),
          hi: i.getInt32(4, !0)
        };
      },
      dec(c, d) {
        return i.setInt32(0, c, !0), i.setInt32(4, d, !0), i.getBigInt64(0, !0);
      },
      uDec(c, d) {
        return i.setInt32(0, c, !0), i.setInt32(4, d, !0), i.getBigUint64(0, !0);
      }
    };
  }
  const t = (r) => ie(/^-?[0-9]+$/.test(r), "int64 invalid: ".concat(r)), n = (r) => ie(/^[0-9]+$/.test(r), "uint64 invalid: ".concat(r));
  return {
    zero: "0",
    supported: !1,
    parse(r) {
      return typeof r != "string" && (r = r.toString()), t(r), r;
    },
    uParse(r) {
      return typeof r != "string" && (r = r.toString()), n(r), r;
    },
    enc(r) {
      return typeof r != "string" && (r = r.toString()), t(r), Va(r);
    },
    uEnc(r) {
      return typeof r != "string" && (r = r.toString()), n(r), Va(r);
    },
    dec(r, s) {
      return Cu(r, s);
    },
    uDec(r, s) {
      return id(r, s);
    }
  };
}
const te = _u();
var E;
(function(i) {
  i[i.DOUBLE = 1] = "DOUBLE", i[i.FLOAT = 2] = "FLOAT", i[i.INT64 = 3] = "INT64", i[i.UINT64 = 4] = "UINT64", i[i.INT32 = 5] = "INT32", i[i.FIXED64 = 6] = "FIXED64", i[i.FIXED32 = 7] = "FIXED32", i[i.BOOL = 8] = "BOOL", i[i.STRING = 9] = "STRING", i[i.BYTES = 12] = "BYTES", i[i.UINT32 = 13] = "UINT32", i[i.SFIXED32 = 15] = "SFIXED32", i[i.SFIXED64 = 16] = "SFIXED64", i[i.SINT32 = 17] = "SINT32", i[i.SINT64 = 18] = "SINT64";
})(E || (E = {}));
var Mt;
(function(i) {
  i[i.BIGINT = 0] = "BIGINT", i[i.STRING = 1] = "STRING";
})(Mt || (Mt = {}));
function St(i, e, t) {
  if (e === t)
    return !0;
  if (i == E.BYTES) {
    if (!(e instanceof Uint8Array) || !(t instanceof Uint8Array) || e.length !== t.length)
      return !1;
    for (let n = 0; n < e.length; n++)
      if (e[n] !== t[n])
        return !1;
    return !0;
  }
  switch (i) {
    case E.UINT64:
    case E.FIXED64:
    case E.INT64:
    case E.SFIXED64:
    case E.SINT64:
      return e == t;
  }
  return !1;
}
function yn(i, e) {
  switch (i) {
    case E.BOOL:
      return !1;
    case E.UINT64:
    case E.FIXED64:
    case E.INT64:
    case E.SFIXED64:
    case E.SINT64:
      return e == 0 ? te.zero : "0";
    case E.DOUBLE:
    case E.FLOAT:
      return 0;
    case E.BYTES:
      return new Uint8Array(0);
    case E.STRING:
      return "";
    default:
      return 0;
  }
}
function sd(i, e) {
  switch (i) {
    case E.BOOL:
      return e === !1;
    case E.STRING:
      return e === "";
    case E.BYTES:
      return e instanceof Uint8Array && !e.byteLength;
    default:
      return e == 0;
  }
}
function Pu(i, e) {
  this.v = i, this.k = e;
}
function ns(i, e) {
  (e == null || e > i.length) && (e = i.length);
  for (var t = 0, n = Array(e); t < e; t++) n[t] = i[t];
  return n;
}
function ad(i) {
  if (Array.isArray(i)) return i;
}
function D(i, e, t) {
  return (e = Du(e)) in i ? Object.defineProperty(i, e, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : i[e] = t, i;
}
function Ru(i) {
  if (typeof Symbol < "u" && i[Symbol.iterator] != null || i["@@iterator"] != null) return Array.from(i);
}
function Iu(i, e) {
  var t = i == null ? null : typeof Symbol < "u" && i[Symbol.iterator] || i["@@iterator"];
  if (t != null) {
    var n, r, s, o, a = [], c = !0, d = !1;
    try {
      if (s = (t = t.call(i)).next, e === 0) {
        if (Object(t) !== t) return;
        c = !1;
      } else for (; !(c = (n = s.call(t)).done) && (a.push(n.value), a.length !== e); c = !0) ;
    } catch (l) {
      d = !0, r = l;
    } finally {
      try {
        if (!c && t.return != null && (o = t.return(), Object(o) !== o)) return;
      } finally {
        if (d) throw r;
      }
    }
    return a;
  }
}
function od() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function za(i, e) {
  var t = Object.keys(i);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(i);
    e && (n = n.filter(function(r) {
      return Object.getOwnPropertyDescriptor(i, r).enumerable;
    })), t.push.apply(t, n);
  }
  return t;
}
function Au(i) {
  for (var e = 1; e < arguments.length; e++) {
    var t = arguments[e] != null ? arguments[e] : {};
    e % 2 ? za(Object(t), !0).forEach(function(n) {
      D(i, n, t[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(i, Object.getOwnPropertyDescriptors(t)) : za(Object(t)).forEach(function(n) {
      Object.defineProperty(i, n, Object.getOwnPropertyDescriptor(t, n));
    });
  }
  return i;
}
function xu(i, e) {
  if (i == null) return {};
  var t, n, r = Mu(i, e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(i);
    for (n = 0; n < s.length; n++) t = s[n], e.indexOf(t) === -1 && {}.propertyIsEnumerable.call(i, t) && (r[t] = i[t]);
  }
  return r;
}
function Mu(i, e) {
  if (i == null) return {};
  var t = {};
  for (var n in i) if ({}.hasOwnProperty.call(i, n)) {
    if (e.indexOf(n) !== -1) continue;
    t[n] = i[n];
  }
  return t;
}
function L(i, e) {
  return ad(i) || Iu(i, e) || cd(i, e) || od();
}
function Ou(i) {
  return ad(i) || Ru(i) || cd(i) || od();
}
function Lu(i, e) {
  if (typeof i != "object" || !i) return i;
  var t = i[Symbol.toPrimitive];
  if (t !== void 0) {
    var n = t.call(i, e);
    if (typeof n != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(i);
}
function Du(i) {
  var e = Lu(i, "string");
  return typeof e == "symbol" ? e : e + "";
}
function cd(i, e) {
  if (i) {
    if (typeof i == "string") return ns(i, e);
    var t = {}.toString.call(i).slice(8, -1);
    return t === "Object" && i.constructor && (t = i.constructor.name), t === "Map" || t === "Set" ? Array.from(i) : t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? ns(i, e) : void 0;
  }
}
function Nu(i) {
  return function() {
    return new Ln(i.apply(this, arguments));
  };
}
function Ln(i) {
  var e, t;
  function n(s, o) {
    try {
      var a = i[s](o), c = a.value, d = c instanceof Pu;
      Promise.resolve(d ? c.v : c).then(function(l) {
        if (d) {
          var u = s === "return" && c.k ? s : "next";
          if (!c.k || l.done) return n(u, l);
          l = i[u](l).value;
        }
        r(!!a.done, l);
      }, function(l) {
        n("throw", l);
      });
    } catch (l) {
      r(2, l);
    }
  }
  function r(s, o) {
    s === 2 ? e.reject(o) : e.resolve({
      value: o,
      done: s
    }), (e = e.next) ? n(e.key, e.arg) : t = null;
  }
  this._invoke = function(s, o) {
    return new Promise(function(a, c) {
      var d = {
        key: s,
        arg: o,
        resolve: a,
        reject: c,
        next: null
      };
      t ? t = t.next = d : (e = t = d, n(s, o));
    });
  }, typeof i.return != "function" && (this.return = void 0);
}
Ln.prototype[typeof Symbol == "function" && Symbol.asyncIterator || "@@asyncIterator"] = function() {
  return this;
}, Ln.prototype.next = function(i) {
  return this._invoke("next", i);
}, Ln.prototype.throw = function(i) {
  return this._invoke("throw", i);
}, Ln.prototype.return = function(i) {
  return this._invoke("return", i);
};
var ae;
(function(i) {
  i[i.Varint = 0] = "Varint", i[i.Bit64 = 1] = "Bit64", i[i.LengthDelimited = 2] = "LengthDelimited", i[i.StartGroup = 3] = "StartGroup", i[i.EndGroup = 4] = "EndGroup", i[i.Bit32 = 5] = "Bit32";
})(ae || (ae = {}));
class Uu {
  constructor(e) {
    this.stack = [], this.textEncoder = e ?? new TextEncoder(), this.chunks = [], this.buf = [];
  }
  /**
   * Return all bytes written and reset this writer.
   */
  finish() {
    this.chunks.push(new Uint8Array(this.buf));
    let e = 0;
    for (let r = 0; r < this.chunks.length; r++) e += this.chunks[r].length;
    let t = new Uint8Array(e), n = 0;
    for (let r = 0; r < this.chunks.length; r++)
      t.set(this.chunks[r], n), n += this.chunks[r].length;
    return this.chunks = [], t;
  }
  /**
   * Start a new fork for length-delimited data like a message
   * or a packed repeated field.
   *
   * Must be joined later with `join()`.
   */
  fork() {
    return this.stack.push({
      chunks: this.chunks,
      buf: this.buf
    }), this.chunks = [], this.buf = [], this;
  }
  /**
   * Join the last fork. Write its length and bytes, then
   * return to the previous state.
   */
  join() {
    let e = this.finish(), t = this.stack.pop();
    if (!t) throw new Error("invalid state, fork stack empty");
    return this.chunks = t.chunks, this.buf = t.buf, this.uint32(e.byteLength), this.raw(e);
  }
  /**
   * Writes a tag (field number and wire type).
   *
   * Equivalent to `uint32( (fieldNo << 3 | type) >>> 0 )`.
   *
   * Generated code should compute the tag ahead of time and call `uint32()`.
   */
  tag(e, t) {
    return this.uint32((e << 3 | t) >>> 0);
  }
  /**
   * Write a chunk of raw bytes.
   */
  raw(e) {
    return this.buf.length && (this.chunks.push(new Uint8Array(this.buf)), this.buf = []), this.chunks.push(e), this;
  }
  /**
   * Write a `uint32` value, an unsigned 32 bit varint.
   */
  uint32(e) {
    for (ts(e); e > 127; )
      this.buf.push(e & 127 | 128), e = e >>> 7;
    return this.buf.push(e), this;
  }
  /**
   * Write a `int32` value, a signed 32 bit varint.
   */
  int32(e) {
    return wi(e), Ha(e, this.buf), this;
  }
  /**
   * Write a `bool` value, a variant.
   */
  bool(e) {
    return this.buf.push(e ? 1 : 0), this;
  }
  /**
   * Write a `bytes` value, length-delimited arbitrary data.
   */
  bytes(e) {
    return this.uint32(e.byteLength), this.raw(e);
  }
  /**
   * Write a `string` value, length-delimited data converted to UTF-8 text.
   */
  string(e) {
    let t = this.textEncoder.encode(e);
    return this.uint32(t.byteLength), this.raw(t);
  }
  /**
   * Write a `float` value, 32-bit floating point number.
   */
  float(e) {
    Xc(e);
    let t = new Uint8Array(4);
    return new DataView(t.buffer).setFloat32(0, e, !0), this.raw(t);
  }
  /**
   * Write a `double` value, a 64-bit floating point number.
   */
  double(e) {
    let t = new Uint8Array(8);
    return new DataView(t.buffer).setFloat64(0, e, !0), this.raw(t);
  }
  /**
   * Write a `fixed32` value, an unsigned, fixed-length 32-bit integer.
   */
  fixed32(e) {
    ts(e);
    let t = new Uint8Array(4);
    return new DataView(t.buffer).setUint32(0, e, !0), this.raw(t);
  }
  /**
   * Write a `sfixed32` value, a signed, fixed-length 32-bit integer.
   */
  sfixed32(e) {
    wi(e);
    let t = new Uint8Array(4);
    return new DataView(t.buffer).setInt32(0, e, !0), this.raw(t);
  }
  /**
   * Write a `sint32` value, a signed, zigzag-encoded 32-bit varint.
   */
  sint32(e) {
    return wi(e), e = (e << 1 ^ e >> 31) >>> 0, Ha(e, this.buf), this;
  }
  /**
   * Write a `fixed64` value, a signed, fixed-length 64-bit integer.
   */
  sfixed64(e) {
    let t = new Uint8Array(8), n = new DataView(t.buffer), r = te.enc(e);
    return n.setInt32(0, r.lo, !0), n.setInt32(4, r.hi, !0), this.raw(t);
  }
  /**
   * Write a `fixed64` value, an unsigned, fixed-length 64 bit integer.
   */
  fixed64(e) {
    let t = new Uint8Array(8), n = new DataView(t.buffer), r = te.uEnc(e);
    return n.setInt32(0, r.lo, !0), n.setInt32(4, r.hi, !0), this.raw(t);
  }
  /**
   * Write a `int64` value, a signed 64-bit varint.
   */
  int64(e) {
    let t = te.enc(e);
    return pr(t.lo, t.hi, this.buf), this;
  }
  /**
   * Write a `sint64` value, a signed, zig-zag-encoded 64-bit varint.
   */
  sint64(e) {
    let t = te.enc(e), n = t.hi >> 31, r = t.lo << 1 ^ n, s = (t.hi << 1 | t.lo >>> 31) ^ n;
    return pr(r, s, this.buf), this;
  }
  /**
   * Write a `uint64` value, an unsigned 64-bit varint.
   */
  uint64(e) {
    let t = te.uEnc(e);
    return pr(t.lo, t.hi, this.buf), this;
  }
}
class Fu {
  constructor(e, t) {
    this.varint64 = Su, this.uint32 = Eu, this.buf = e, this.len = e.length, this.pos = 0, this.view = new DataView(e.buffer, e.byteOffset, e.byteLength), this.textDecoder = t ?? new TextDecoder();
  }
  /**
   * Reads a tag - field number and wire type.
   */
  tag() {
    let e = this.uint32(), t = e >>> 3, n = e & 7;
    if (t <= 0 || n < 0 || n > 5) throw new Error("illegal tag: field no " + t + " wire type " + n);
    return [t, n];
  }
  /**
   * Skip one element and return the skipped data.
   *
   * When skipping StartGroup, provide the tags field number to check for
   * matching field number in the EndGroup tag.
   */
  skip(e, t) {
    let n = this.pos;
    switch (e) {
      case ae.Varint:
        for (; this.buf[this.pos++] & 128; )
          ;
        break;
      // eslint-disable-next-line
      // @ts-ignore TS7029: Fallthrough case in switch
      case ae.Bit64:
        this.pos += 4;
      // eslint-disable-next-line
      // @ts-ignore TS7029: Fallthrough case in switch
      case ae.Bit32:
        this.pos += 4;
        break;
      case ae.LengthDelimited:
        let r = this.uint32();
        this.pos += r;
        break;
      case ae.StartGroup:
        for (; ; ) {
          const s = this.tag(), o = L(s, 2), a = o[0], c = o[1];
          if (c === ae.EndGroup) {
            if (t !== void 0 && a !== t)
              throw new Error("invalid end group tag");
            break;
          }
          this.skip(c, a);
        }
        break;
      default:
        throw new Error("cant skip wire type " + e);
    }
    return this.assertBounds(), this.buf.subarray(n, this.pos);
  }
  /**
   * Throws error if position in byte array is out of range.
   */
  assertBounds() {
    if (this.pos > this.len) throw new RangeError("premature EOF");
  }
  /**
   * Read a `int32` field, a signed 32 bit varint.
   */
  int32() {
    return this.uint32() | 0;
  }
  /**
   * Read a `sint32` field, a signed, zigzag-encoded 32-bit varint.
   */
  sint32() {
    let e = this.uint32();
    return e >>> 1 ^ -(e & 1);
  }
  /**
   * Read a `int64` field, a signed 64-bit varint.
   */
  int64() {
    return te.dec(...this.varint64());
  }
  /**
   * Read a `uint64` field, an unsigned 64-bit varint.
   */
  uint64() {
    return te.uDec(...this.varint64());
  }
  /**
   * Read a `sint64` field, a signed, zig-zag-encoded 64-bit varint.
   */
  sint64() {
    let e = this.varint64(), t = L(e, 2), n = t[0], r = t[1], s = -(n & 1);
    return n = (n >>> 1 | (r & 1) << 31) ^ s, r = r >>> 1 ^ s, te.dec(n, r);
  }
  /**
   * Read a `bool` field, a variant.
   */
  bool() {
    let e = this.varint64(), t = L(e, 2), n = t[0], r = t[1];
    return n !== 0 || r !== 0;
  }
  /**
   * Read a `fixed32` field, an unsigned, fixed-length 32-bit integer.
   */
  fixed32() {
    return this.view.getUint32((this.pos += 4) - 4, !0);
  }
  /**
   * Read a `sfixed32` field, a signed, fixed-length 32-bit integer.
   */
  sfixed32() {
    return this.view.getInt32((this.pos += 4) - 4, !0);
  }
  /**
   * Read a `fixed64` field, an unsigned, fixed-length 64 bit integer.
   */
  fixed64() {
    return te.uDec(this.sfixed32(), this.sfixed32());
  }
  /**
   * Read a `fixed64` field, a signed, fixed-length 64-bit integer.
   */
  sfixed64() {
    return te.dec(this.sfixed32(), this.sfixed32());
  }
  /**
   * Read a `float` field, 32-bit floating point number.
   */
  float() {
    return this.view.getFloat32((this.pos += 4) - 4, !0);
  }
  /**
   * Read a `double` field, a 64-bit floating point number.
   */
  double() {
    return this.view.getFloat64((this.pos += 8) - 8, !0);
  }
  /**
   * Read a `bytes` field, length-delimited arbitrary data.
   */
  bytes() {
    let e = this.uint32(), t = this.pos;
    return this.pos += e, this.assertBounds(), this.buf.subarray(t, t + e);
  }
  /**
   * Read a `string` field, length-delimited data converted to UTF-8 text.
   */
  string() {
    return this.textDecoder.decode(this.bytes());
  }
}
function Bu(i, e, t, n) {
  let r;
  return {
    typeName: e,
    extendee: t,
    get field() {
      if (!r) {
        const s = typeof n == "function" ? n() : n;
        s.name = e.split(".").pop(), s.jsonName = "[".concat(e, "]"), r = i.util.newFieldList([s]).list()[0];
      }
      return r;
    },
    runtime: i
  };
}
function dd(i) {
  const e = i.field.localName, t = /* @__PURE__ */ Object.create(null);
  return t[e] = ju(i), [t, () => t[e]];
}
function ju(i) {
  const e = i.field;
  if (e.repeated)
    return [];
  if (e.default !== void 0)
    return e.default;
  switch (e.kind) {
    case "enum":
      return e.T.values[0].no;
    case "scalar":
      return yn(e.T, e.L);
    case "message":
      const t = e.T, n = new t();
      return t.fieldWrapper ? t.fieldWrapper.unwrapField(n) : n;
    case "map":
      throw "map fields are not allowed to be extensions";
  }
}
function qu(i, e) {
  if (!e.repeated && (e.kind == "enum" || e.kind == "scalar")) {
    for (let t = i.length - 1; t >= 0; --t)
      if (i[t].no == e.no)
        return [i[t]];
    return [];
  }
  return i.filter((t) => t.no === e.no);
}
let ft = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(""), Gi = [];
for (let i = 0; i < ft.length; i++) Gi[ft[i].charCodeAt(0)] = i;
Gi[45] = ft.indexOf("+");
Gi[95] = ft.indexOf("/");
const ld = {
  /**
   * Decodes a base64 string to a byte array.
   *
   * - ignores white-space, including line breaks and tabs
   * - allows inner padding (can decode concatenated base64 strings)
   * - does not require padding
   * - understands base64url encoding:
   *   "-" instead of "+",
   *   "_" instead of "/",
   *   no padding
   */
  dec(i) {
    let e = i.length * 3 / 4;
    i[i.length - 2] == "=" ? e -= 2 : i[i.length - 1] == "=" && (e -= 1);
    let t = new Uint8Array(e), n = 0, r = 0, s, o = 0;
    for (let a = 0; a < i.length; a++) {
      if (s = Gi[i.charCodeAt(a)], s === void 0)
        switch (i[a]) {
          // @ts-ignore TS7029: Fallthrough case in switch
          case "=":
            r = 0;
          // reset state when padding found
          // @ts-ignore TS7029: Fallthrough case in switch
          case `
`:
          case "\r":
          case "	":
          case " ":
            continue;
          // skip white-space, and padding
          default:
            throw Error("invalid base64 string.");
        }
      switch (r) {
        case 0:
          o = s, r = 1;
          break;
        case 1:
          t[n++] = o << 2 | (s & 48) >> 4, o = s, r = 2;
          break;
        case 2:
          t[n++] = (o & 15) << 4 | (s & 60) >> 2, o = s, r = 3;
          break;
        case 3:
          t[n++] = (o & 3) << 6 | s, r = 0;
          break;
      }
    }
    if (r == 1) throw Error("invalid base64 string.");
    return t.subarray(0, n);
  },
  /**
   * Encode a byte array to a base64 string.
   */
  enc(i) {
    let e = "", t = 0, n, r = 0;
    for (let s = 0; s < i.length; s++)
      switch (n = i[s], t) {
        case 0:
          e += ft[n >> 2], r = (n & 3) << 4, t = 1;
          break;
        case 1:
          e += ft[r | n >> 4], r = (n & 15) << 2, t = 2;
          break;
        case 2:
          e += ft[r | n >> 6], e += ft[n & 63], t = 0;
          break;
      }
    return t && (e += ft[r], e += "=", t == 1 && (e += "=")), e;
  }
};
function Vu(i, e, t) {
  hd(e, i);
  const n = e.runtime.bin.makeReadOptions(t), r = qu(i.getType().runtime.bin.listUnknownFields(i), e.field), s = dd(e), o = L(s, 2), a = o[0], c = o[1];
  for (const d of r)
    e.runtime.bin.readField(a, n.readerFactory(d.data), e.field, d.wireType, n);
  return c();
}
function Wu(i, e, t, n) {
  hd(e, i);
  const r = e.runtime.bin.makeReadOptions(n), s = e.runtime.bin.makeWriteOptions(n);
  if (ud(i, e)) {
    const d = i.getType().runtime.bin.listUnknownFields(i).filter((l) => l.no != e.field.no);
    i.getType().runtime.bin.discardUnknownFields(i);
    for (const l of d)
      i.getType().runtime.bin.onUnknownField(i, l.no, l.wireType, l.data);
  }
  const o = s.writerFactory();
  let a = e.field;
  !a.opt && !a.repeated && (a.kind == "enum" || a.kind == "scalar") && (a = Object.assign(Object.assign({}, e.field), {
    opt: !0
  })), e.runtime.bin.writeField(a, t, o, s);
  const c = r.readerFactory(o.finish());
  for (; c.pos < c.len; ) {
    const d = c.tag(), l = L(d, 2), u = l[0], h = l[1], f = c.skip(h, u);
    i.getType().runtime.bin.onUnknownField(i, u, h, f);
  }
}
function ud(i, e) {
  const t = i.getType();
  return e.extendee.typeName === t.typeName && !!t.runtime.bin.listUnknownFields(i).find((n) => n.no == e.field.no);
}
function hd(i, e) {
  ie(i.extendee.typeName == e.getType().typeName, "extension ".concat(i.typeName, " can only be applied to message ").concat(i.extendee.typeName));
}
function fd(i, e) {
  const t = i.localName;
  if (i.repeated)
    return e[t].length > 0;
  if (i.oneof)
    return e[i.oneof.localName].case === t;
  switch (i.kind) {
    case "enum":
    case "scalar":
      return i.opt || i.req ? e[t] !== void 0 : i.kind == "enum" ? e[t] !== i.T.values[0].no : !sd(i.T, e[t]);
    case "message":
      return e[t] !== void 0;
    case "map":
      return Object.keys(e[t]).length > 0;
  }
}
function Ka(i, e) {
  const t = i.localName, n = !i.opt && !i.req;
  if (i.repeated)
    e[t] = [];
  else if (i.oneof)
    e[i.oneof.localName] = {
      case: void 0
    };
  else
    switch (i.kind) {
      case "map":
        e[t] = {};
        break;
      case "enum":
        e[t] = n ? i.T.values[0].no : void 0;
        break;
      case "scalar":
        e[t] = n ? yn(i.T, i.L) : void 0;
        break;
      case "message":
        e[t] = void 0;
        break;
    }
}
function pt(i, e) {
  if (i === null || typeof i != "object" || !Object.getOwnPropertyNames(Fs.prototype).every((n) => n in i && typeof i[n] == "function"))
    return !1;
  const t = i.getType();
  return t === null || typeof t != "function" || !("typeName" in t) || typeof t.typeName != "string" ? !1 : e === void 0 ? !0 : t.typeName == e.typeName;
}
function pd(i, e) {
  return pt(e) || !i.fieldWrapper ? e : i.fieldWrapper.wrapField(e);
}
E.DOUBLE, E.FLOAT, E.INT64, E.UINT64, E.INT32, E.UINT32, E.BOOL, E.STRING, E.BYTES;
const Ga = {
  ignoreUnknownFields: !1
}, Ja = {
  emitDefaultValues: !1,
  enumAsInteger: !1,
  useProtoFieldName: !1,
  prettySpaces: 0
};
function Hu(i) {
  return i ? Object.assign(Object.assign({}, Ga), i) : Ga;
}
function zu(i) {
  return i ? Object.assign(Object.assign({}, Ja), i) : Ja;
}
const Oi = /* @__PURE__ */ Symbol(), _i = /* @__PURE__ */ Symbol();
function Ku() {
  return {
    makeReadOptions: Hu,
    makeWriteOptions: zu,
    readMessage(i, e, t, n) {
      if (e == null || Array.isArray(e) || typeof e != "object")
        throw new Error("cannot decode message ".concat(i.typeName, " from JSON: ").concat(tt(e)));
      n = n ?? new i();
      const r = /* @__PURE__ */ new Map(), s = t.typeRegistry;
      for (const a of Object.entries(e)) {
        var o = L(a, 2);
        const c = o[0], d = o[1], l = i.fields.findJsonName(c);
        if (l) {
          if (l.oneof) {
            if (d === null && l.kind == "scalar")
              continue;
            const u = r.get(l.oneof);
            if (u !== void 0)
              throw new Error("cannot decode message ".concat(i.typeName, ' from JSON: multiple keys for oneof "').concat(l.oneof.name, '" present: "').concat(u, '", "').concat(c, '"'));
            r.set(l.oneof, c);
          }
          $a(n, d, l, t, i);
        } else {
          let u = !1;
          if (s?.findExtension && c.startsWith("[") && c.endsWith("]")) {
            const h = s.findExtension(c.substring(1, c.length - 1));
            if (h && h.extendee.typeName == i.typeName) {
              u = !0;
              const f = dd(h), g = L(f, 2), p = g[0], y = g[1];
              $a(p, d, h.field, t, h), Wu(n, h, y(), t);
            }
          }
          if (!u && !t.ignoreUnknownFields)
            throw new Error("cannot decode message ".concat(i.typeName, ' from JSON: key "').concat(c, '" is unknown'));
        }
      }
      return n;
    },
    writeMessage(i, e) {
      const t = i.getType(), n = {};
      let r;
      try {
        for (r of t.fields.byNumber()) {
          if (!fd(r, i)) {
            if (r.req)
              throw "required field not set";
            if (!e.emitDefaultValues || !Ju(r))
              continue;
          }
          const o = r.oneof ? i[r.oneof.localName].value : i[r.localName], a = Qa(r, o, e);
          a !== void 0 && (n[e.useProtoFieldName ? r.name : r.jsonName] = a);
        }
        const s = e.typeRegistry;
        if (s?.findExtensionFor)
          for (const o of t.runtime.bin.listUnknownFields(i)) {
            const a = s.findExtensionFor(t.typeName, o.no);
            if (a && ud(i, a)) {
              const c = Vu(i, a, e), d = Qa(a.field, c, e);
              d !== void 0 && (n[a.field.jsonName] = d);
            }
          }
      } catch (s) {
        const o = r ? "cannot encode field ".concat(t.typeName, ".").concat(r.name, " to JSON") : "cannot encode message ".concat(t.typeName, " to JSON"), a = s instanceof Error ? s.message : String(s);
        throw new Error(o + (a.length > 0 ? ": ".concat(a) : ""));
      }
      return n;
    },
    readScalar(i, e, t) {
      return Dn(i, e, t ?? Mt.BIGINT, !0);
    },
    writeScalar(i, e, t) {
      if (e !== void 0 && (t || sd(i, e)))
        return Pi(i, e);
    },
    debug: tt
  };
}
function tt(i) {
  if (i === null)
    return "null";
  switch (typeof i) {
    case "object":
      return Array.isArray(i) ? "array" : "object";
    case "string":
      return i.length > 100 ? "string" : '"'.concat(i.split('"').join('\\"'), '"');
    default:
      return String(i);
  }
}
function $a(i, e, t, n, r) {
  let s = t.localName;
  if (t.repeated) {
    if (ie(t.kind != "map"), e === null)
      return;
    if (!Array.isArray(e))
      throw new Error("cannot decode field ".concat(r.typeName, ".").concat(t.name, " from JSON: ").concat(tt(e)));
    const a = i[s];
    for (const c of e) {
      if (c === null)
        throw new Error("cannot decode field ".concat(r.typeName, ".").concat(t.name, " from JSON: ").concat(tt(c)));
      switch (t.kind) {
        case "message":
          a.push(t.T.fromJson(c, n));
          break;
        case "enum":
          const d = mr(t.T, c, n.ignoreUnknownFields, !0);
          d !== _i && a.push(d);
          break;
        case "scalar":
          try {
            a.push(Dn(t.T, c, t.L, !0));
          } catch (l) {
            let u = "cannot decode field ".concat(r.typeName, ".").concat(t.name, " from JSON: ").concat(tt(c));
            throw l instanceof Error && l.message.length > 0 && (u += ": ".concat(l.message)), new Error(u);
          }
          break;
      }
    }
  } else if (t.kind == "map") {
    if (e === null)
      return;
    if (typeof e != "object" || Array.isArray(e))
      throw new Error("cannot decode field ".concat(r.typeName, ".").concat(t.name, " from JSON: ").concat(tt(e)));
    const a = i[s];
    for (const c of Object.entries(e)) {
      var o = L(c, 2);
      const d = o[0], l = o[1];
      if (l === null)
        throw new Error("cannot decode field ".concat(r.typeName, ".").concat(t.name, " from JSON: map value null"));
      let u;
      try {
        u = Gu(t.K, d);
      } catch (h) {
        let f = "cannot decode map key for field ".concat(r.typeName, ".").concat(t.name, " from JSON: ").concat(tt(e));
        throw h instanceof Error && h.message.length > 0 && (f += ": ".concat(h.message)), new Error(f);
      }
      switch (t.V.kind) {
        case "message":
          a[u] = t.V.T.fromJson(l, n);
          break;
        case "enum":
          const h = mr(t.V.T, l, n.ignoreUnknownFields, !0);
          h !== _i && (a[u] = h);
          break;
        case "scalar":
          try {
            a[u] = Dn(t.V.T, l, Mt.BIGINT, !0);
          } catch (f) {
            let g = "cannot decode map value for field ".concat(r.typeName, ".").concat(t.name, " from JSON: ").concat(tt(e));
            throw f instanceof Error && f.message.length > 0 && (g += ": ".concat(f.message)), new Error(g);
          }
          break;
      }
    }
  } else
    switch (t.oneof && (i = i[t.oneof.localName] = {
      case: s
    }, s = "value"), t.kind) {
      case "message":
        const a = t.T;
        if (e === null && a.typeName != "google.protobuf.Value")
          return;
        let c = i[s];
        pt(c) ? c.fromJson(e, n) : (i[s] = c = a.fromJson(e, n), a.fieldWrapper && !t.oneof && (i[s] = a.fieldWrapper.unwrapField(c)));
        break;
      case "enum":
        const d = mr(t.T, e, n.ignoreUnknownFields, !1);
        switch (d) {
          case Oi:
            Ka(t, i);
            break;
          case _i:
            break;
          default:
            i[s] = d;
            break;
        }
        break;
      case "scalar":
        try {
          const l = Dn(t.T, e, t.L, !1);
          l === Oi ? Ka(t, i) : i[s] = l;
        } catch (l) {
          let u = "cannot decode field ".concat(r.typeName, ".").concat(t.name, " from JSON: ").concat(tt(e));
          throw l instanceof Error && l.message.length > 0 && (u += ": ".concat(l.message)), new Error(u);
        }
        break;
    }
}
function Gu(i, e) {
  if (i === E.BOOL)
    switch (e) {
      case "true":
        e = !0;
        break;
      case "false":
        e = !1;
        break;
    }
  return Dn(i, e, Mt.BIGINT, !0).toString();
}
function Dn(i, e, t, n) {
  if (e === null)
    return n ? yn(i, t) : Oi;
  switch (i) {
    // float, double: JSON value will be a number or one of the special string values "NaN", "Infinity", and "-Infinity".
    // Either numbers or strings are accepted. Exponent notation is also accepted.
    case E.DOUBLE:
    case E.FLOAT:
      if (e === "NaN") return Number.NaN;
      if (e === "Infinity") return Number.POSITIVE_INFINITY;
      if (e === "-Infinity") return Number.NEGATIVE_INFINITY;
      if (e === "" || typeof e == "string" && e.trim().length !== e.length || typeof e != "string" && typeof e != "number")
        break;
      const r = Number(e);
      if (Number.isNaN(r) || !Number.isFinite(r))
        break;
      return i == E.FLOAT && Xc(r), r;
    // int32, fixed32, uint32: JSON value will be a decimal number. Either numbers or strings are accepted.
    case E.INT32:
    case E.FIXED32:
    case E.SFIXED32:
    case E.SINT32:
    case E.UINT32:
      let s;
      if (typeof e == "number" ? s = e : typeof e == "string" && e.length > 0 && e.trim().length === e.length && (s = Number(e)), s === void 0) break;
      return i == E.UINT32 || i == E.FIXED32 ? ts(s) : wi(s), s;
    // int64, fixed64, uint64: JSON value will be a decimal string. Either numbers or strings are accepted.
    case E.INT64:
    case E.SFIXED64:
    case E.SINT64:
      if (typeof e != "number" && typeof e != "string") break;
      const o = te.parse(e);
      return t ? o.toString() : o;
    case E.FIXED64:
    case E.UINT64:
      if (typeof e != "number" && typeof e != "string") break;
      const a = te.uParse(e);
      return t ? a.toString() : a;
    // bool:
    case E.BOOL:
      if (typeof e != "boolean") break;
      return e;
    // string:
    case E.STRING:
      if (typeof e != "string")
        break;
      try {
        encodeURIComponent(e);
      } catch {
        throw new Error("invalid UTF8");
      }
      return e;
    // bytes: JSON value will be the data encoded as a string using standard base64 encoding with paddings.
    // Either standard or URL-safe base64 encoding with/without paddings are accepted.
    case E.BYTES:
      if (e === "") return new Uint8Array(0);
      if (typeof e != "string") break;
      return ld.dec(e);
  }
  throw new Error();
}
function mr(i, e, t, n) {
  if (e === null)
    return i.typeName == "google.protobuf.NullValue" ? 0 : n ? i.values[0].no : Oi;
  switch (typeof e) {
    case "number":
      if (Number.isInteger(e))
        return e;
      break;
    case "string":
      const r = i.findName(e);
      if (r !== void 0)
        return r.no;
      if (t)
        return _i;
      break;
  }
  throw new Error("cannot decode enum ".concat(i.typeName, " from JSON: ").concat(tt(e)));
}
function Ju(i) {
  return i.repeated || i.kind == "map" ? !0 : !(i.oneof || i.kind == "message" || i.opt || i.req);
}
function Qa(i, e, t) {
  if (i.kind == "map") {
    ie(typeof e == "object" && e != null);
    const o = {}, a = Object.entries(e);
    switch (i.V.kind) {
      case "scalar":
        for (const d of a) {
          var n = L(d, 2);
          const l = n[0], u = n[1];
          o[l.toString()] = Pi(i.V.T, u);
        }
        break;
      case "message":
        for (const d of a) {
          var r = L(d, 2);
          const l = r[0], u = r[1];
          o[l.toString()] = u.toJson(t);
        }
        break;
      case "enum":
        const c = i.V.T;
        for (const d of a) {
          var s = L(d, 2);
          const l = s[0], u = s[1];
          o[l.toString()] = gr(c, u, t.enumAsInteger);
        }
        break;
    }
    return t.emitDefaultValues || a.length > 0 ? o : void 0;
  }
  if (i.repeated) {
    ie(Array.isArray(e));
    const o = [];
    switch (i.kind) {
      case "scalar":
        for (let a = 0; a < e.length; a++)
          o.push(Pi(i.T, e[a]));
        break;
      case "enum":
        for (let a = 0; a < e.length; a++)
          o.push(gr(i.T, e[a], t.enumAsInteger));
        break;
      case "message":
        for (let a = 0; a < e.length; a++)
          o.push(e[a].toJson(t));
        break;
    }
    return t.emitDefaultValues || o.length > 0 ? o : void 0;
  }
  switch (i.kind) {
    case "scalar":
      return Pi(i.T, e);
    case "enum":
      return gr(i.T, e, t.enumAsInteger);
    case "message":
      return pd(i.T, e).toJson(t);
  }
}
function gr(i, e, t) {
  var n;
  if (ie(typeof e == "number"), i.typeName == "google.protobuf.NullValue")
    return null;
  if (t)
    return e;
  const r = i.findNumber(e);
  return (n = r?.name) !== null && n !== void 0 ? n : e;
}
function Pi(i, e) {
  switch (i) {
    // int32, fixed32, uint32: JSON value will be a decimal number. Either numbers or strings are accepted.
    case E.INT32:
    case E.SFIXED32:
    case E.SINT32:
    case E.FIXED32:
    case E.UINT32:
      return ie(typeof e == "number"), e;
    // float, double: JSON value will be a number or one of the special string values "NaN", "Infinity", and "-Infinity".
    // Either numbers or strings are accepted. Exponent notation is also accepted.
    case E.FLOAT:
    // assertFloat32(value);
    case E.DOUBLE:
      return ie(typeof e == "number"), Number.isNaN(e) ? "NaN" : e === Number.POSITIVE_INFINITY ? "Infinity" : e === Number.NEGATIVE_INFINITY ? "-Infinity" : e;
    // string:
    case E.STRING:
      return ie(typeof e == "string"), e;
    // bool:
    case E.BOOL:
      return ie(typeof e == "boolean"), e;
    // JSON value will be a decimal string. Either numbers or strings are accepted.
    case E.UINT64:
    case E.FIXED64:
    case E.INT64:
    case E.SFIXED64:
    case E.SINT64:
      return ie(typeof e == "bigint" || typeof e == "string" || typeof e == "number"), e.toString();
    // bytes: JSON value will be the data encoded as a string using standard base64 encoding with paddings.
    // Either standard or URL-safe base64 encoding with/without paddings are accepted.
    case E.BYTES:
      return ie(e instanceof Uint8Array), ld.enc(e);
  }
}
const Zt = /* @__PURE__ */ Symbol("@bufbuild/protobuf/unknown-fields"), Ya = {
  readUnknownFields: !0,
  readerFactory: (i) => new Fu(i)
}, Xa = {
  writeUnknownFields: !0,
  writerFactory: () => new Uu()
};
function $u(i) {
  return i ? Object.assign(Object.assign({}, Ya), i) : Ya;
}
function Qu(i) {
  return i ? Object.assign(Object.assign({}, Xa), i) : Xa;
}
function Yu() {
  return {
    makeReadOptions: $u,
    makeWriteOptions: Qu,
    listUnknownFields(i) {
      var e;
      return (e = i[Zt]) !== null && e !== void 0 ? e : [];
    },
    discardUnknownFields(i) {
      delete i[Zt];
    },
    writeUnknownFields(i, e) {
      const n = i[Zt];
      if (n)
        for (const r of n)
          e.tag(r.no, r.wireType).raw(r.data);
    },
    onUnknownField(i, e, t, n) {
      const r = i;
      Array.isArray(r[Zt]) || (r[Zt] = []), r[Zt].push({
        no: e,
        wireType: t,
        data: n
      });
    },
    readMessage(i, e, t, n, r) {
      const s = i.getType(), o = r ? e.len : e.pos + t;
      let a, c;
      for (; e.pos < o; ) {
        var d = e.tag(), l = L(d, 2);
        if (a = l[0], c = l[1], r === !0 && c == ae.EndGroup)
          break;
        const u = s.fields.find(a);
        if (!u) {
          const h = e.skip(c, a);
          n.readUnknownFields && this.onUnknownField(i, a, c, h);
          continue;
        }
        Za(i, e, u, c, n);
      }
      if (r && // eslint-disable-line @typescript-eslint/strict-boolean-expressions
      (c != ae.EndGroup || a !== t))
        throw new Error("invalid end group tag");
    },
    readField: Za,
    writeMessage(i, e, t) {
      const n = i.getType();
      for (const r of n.fields.byNumber()) {
        if (!fd(r, i)) {
          if (r.req)
            throw new Error("cannot encode field ".concat(n.typeName, ".").concat(r.name, " to binary: required field not set"));
          continue;
        }
        const s = r.oneof ? i[r.oneof.localName].value : i[r.localName];
        eo(r, s, e, t);
      }
      return t.writeUnknownFields && this.writeUnknownFields(i, e), e;
    },
    writeField(i, e, t, n) {
      e !== void 0 && eo(i, e, t, n);
    }
  };
}
function Za(i, e, t, n, r) {
  let s = t.repeated, o = t.localName;
  switch (t.oneof && (i = i[t.oneof.localName], i.case != o && delete i.value, i.case = o, o = "value"), t.kind) {
    case "scalar":
    case "enum":
      const a = t.kind == "enum" ? E.INT32 : t.T;
      let c = Li;
      if (t.kind == "scalar" && t.L > 0 && (c = Zu), s) {
        let g = i[o];
        if (n == ae.LengthDelimited && a != E.STRING && a != E.BYTES) {
          let y = e.uint32() + e.pos;
          for (; e.pos < y; )
            g.push(c(e, a));
        } else
          g.push(c(e, a));
      } else
        i[o] = c(e, a);
      break;
    case "message":
      const d = t.T;
      s ? i[o].push(Ri(e, new d(), r, t)) : pt(i[o]) ? Ri(e, i[o], r, t) : (i[o] = Ri(e, new d(), r, t), d.fieldWrapper && !t.oneof && !t.repeated && (i[o] = d.fieldWrapper.unwrapField(i[o])));
      break;
    case "map":
      let l = Xu(t, e, r), u = L(l, 2), h = u[0], f = u[1];
      i[o][h] = f;
      break;
  }
}
function Ri(i, e, t, n) {
  const r = e.getType().runtime.bin, s = n?.delimited;
  return r.readMessage(
    e,
    i,
    s ? n.no : i.uint32(),
    // eslint-disable-line @typescript-eslint/strict-boolean-expressions
    t,
    s
  ), e;
}
function Xu(i, e, t) {
  const n = e.uint32(), r = e.pos + n;
  let s, o;
  for (; e.pos < r; ) {
    const a = e.tag();
    switch (L(a, 1)[0]) {
      case 1:
        s = Li(e, i.K);
        break;
      case 2:
        switch (i.V.kind) {
          case "scalar":
            o = Li(e, i.V.T);
            break;
          case "enum":
            o = e.int32();
            break;
          case "message":
            o = Ri(e, new i.V.T(), t, void 0);
            break;
        }
        break;
    }
  }
  if (s === void 0 && (s = yn(i.K, Mt.BIGINT)), typeof s != "string" && typeof s != "number" && (s = s.toString()), o === void 0)
    switch (i.V.kind) {
      case "scalar":
        o = yn(i.V.T, Mt.BIGINT);
        break;
      case "enum":
        o = i.V.T.values[0].no;
        break;
      case "message":
        o = new i.V.T();
        break;
    }
  return [s, o];
}
function Zu(i, e) {
  const t = Li(i, e);
  return typeof t == "bigint" ? t.toString() : t;
}
function Li(i, e) {
  switch (e) {
    case E.STRING:
      return i.string();
    case E.BOOL:
      return i.bool();
    case E.DOUBLE:
      return i.double();
    case E.FLOAT:
      return i.float();
    case E.INT32:
      return i.int32();
    case E.INT64:
      return i.int64();
    case E.UINT64:
      return i.uint64();
    case E.FIXED64:
      return i.fixed64();
    case E.BYTES:
      return i.bytes();
    case E.FIXED32:
      return i.fixed32();
    case E.SFIXED32:
      return i.sfixed32();
    case E.SFIXED64:
      return i.sfixed64();
    case E.SINT64:
      return i.sint64();
    case E.UINT32:
      return i.uint32();
    case E.SINT32:
      return i.sint32();
  }
}
function eo(i, e, t, n) {
  ie(e !== void 0);
  const r = i.repeated;
  switch (i.kind) {
    case "scalar":
    case "enum":
      let o = i.kind == "enum" ? E.INT32 : i.T;
      if (r)
        if (ie(Array.isArray(e)), i.packed)
          th(t, o, i.no, e);
        else
          for (const a of e)
            Nn(t, o, i.no, a);
      else
        Nn(t, o, i.no, e);
      break;
    case "message":
      if (r) {
        ie(Array.isArray(e));
        for (const a of e)
          to(t, n, i, a);
      } else
        to(t, n, i, e);
      break;
    case "map":
      ie(typeof e == "object" && e != null);
      for (const a of Object.entries(e)) {
        var s = L(a, 2);
        const c = s[0], d = s[1];
        eh(t, n, i, c, d);
      }
      break;
  }
}
function eh(i, e, t, n, r) {
  i.tag(t.no, ae.LengthDelimited), i.fork();
  let s = n;
  switch (t.K) {
    case E.INT32:
    case E.FIXED32:
    case E.UINT32:
    case E.SFIXED32:
    case E.SINT32:
      s = Number.parseInt(n);
      break;
    case E.BOOL:
      ie(n == "true" || n == "false"), s = n == "true";
      break;
  }
  switch (Nn(i, t.K, 1, s), t.V.kind) {
    case "scalar":
      Nn(i, t.V.T, 2, r);
      break;
    case "enum":
      Nn(i, E.INT32, 2, r);
      break;
    case "message":
      ie(r !== void 0), i.tag(2, ae.LengthDelimited).bytes(r.toBinary(e));
      break;
  }
  i.join();
}
function to(i, e, t, n) {
  const r = pd(t.T, n);
  t.delimited ? i.tag(t.no, ae.StartGroup).raw(r.toBinary(e)).tag(t.no, ae.EndGroup) : i.tag(t.no, ae.LengthDelimited).bytes(r.toBinary(e));
}
function Nn(i, e, t, n) {
  ie(n !== void 0);
  let r = md(e), s = L(r, 2), o = s[0], a = s[1];
  i.tag(t, o)[a](n);
}
function th(i, e, t, n) {
  if (!n.length)
    return;
  i.tag(t, ae.LengthDelimited).fork();
  let r = md(e), s = L(r, 2), o = s[1];
  for (let a = 0; a < n.length; a++)
    i[o](n[a]);
  i.join();
}
function md(i) {
  let e = ae.Varint;
  switch (i) {
    case E.BYTES:
    case E.STRING:
      e = ae.LengthDelimited;
      break;
    case E.DOUBLE:
    case E.FIXED64:
    case E.SFIXED64:
      e = ae.Bit64;
      break;
    case E.FIXED32:
    case E.SFIXED32:
    case E.FLOAT:
      e = ae.Bit32;
      break;
  }
  const t = E[i].toLowerCase();
  return [e, t];
}
function nh() {
  return {
    setEnumType: ed,
    initPartial(i, e) {
      if (i === void 0)
        return;
      const t = e.getType();
      for (const r of t.fields.byMember()) {
        const s = r.localName, o = e, a = i;
        if (a[s] != null)
          switch (r.kind) {
            case "oneof":
              const c = a[s].case;
              if (c === void 0)
                continue;
              const d = r.findField(c);
              let l = a[s].value;
              d && d.kind == "message" && !pt(l, d.T) ? l = new d.T(l) : d && d.kind === "scalar" && d.T === E.BYTES && (l = Rn(l)), o[s] = {
                case: c,
                value: l
              };
              break;
            case "scalar":
            case "enum":
              let u = a[s];
              r.T === E.BYTES && (u = r.repeated ? u.map(Rn) : Rn(u)), o[s] = u;
              break;
            case "map":
              switch (r.V.kind) {
                case "scalar":
                case "enum":
                  if (r.V.T === E.BYTES)
                    for (const g of Object.entries(a[s])) {
                      var n = L(g, 2);
                      const p = n[0], y = n[1];
                      o[s][p] = Rn(y);
                    }
                  else
                    Object.assign(o[s], a[s]);
                  break;
                case "message":
                  const f = r.V.T;
                  for (const g of Object.keys(a[s])) {
                    let p = a[s][g];
                    f.fieldWrapper || (p = new f(p)), o[s][g] = p;
                  }
                  break;
              }
              break;
            case "message":
              const h = r.T;
              if (r.repeated)
                o[s] = a[s].map((f) => pt(f, h) ? f : new h(f));
              else {
                const f = a[s];
                h.fieldWrapper ? /* We can't use BytesValue.typeName as that will create a circular import */ h.typeName === "google.protobuf.BytesValue" ? o[s] = Rn(f) : o[s] = f : o[s] = pt(f, h) ? f : new h(f);
              }
              break;
          }
      }
    },
    // TODO use isFieldSet() here to support future field presence
    equals(i, e, t) {
      return e === t ? !0 : !e || !t ? !1 : i.fields.byMember().every((n) => {
        const r = e[n.localName], s = t[n.localName];
        if (n.repeated) {
          if (r.length !== s.length)
            return !1;
          switch (n.kind) {
            case "message":
              return r.every((o, a) => n.T.equals(o, s[a]));
            case "scalar":
              return r.every((o, a) => St(n.T, o, s[a]));
            case "enum":
              return r.every((o, a) => St(E.INT32, o, s[a]));
          }
          throw new Error("repeated cannot contain ".concat(n.kind));
        }
        switch (n.kind) {
          case "message":
            let o = r, a = s;
            return n.T.fieldWrapper && (o !== void 0 && !pt(o) && (o = n.T.fieldWrapper.wrapField(o)), a !== void 0 && !pt(a) && (a = n.T.fieldWrapper.wrapField(a))), n.T.equals(o, a);
          case "enum":
            return St(E.INT32, r, s);
          case "scalar":
            return St(n.T, r, s);
          case "oneof":
            if (r.case !== s.case)
              return !1;
            const c = n.findField(r.case);
            if (c === void 0)
              return !0;
            switch (c.kind) {
              case "message":
                return c.T.equals(r.value, s.value);
              case "enum":
                return St(E.INT32, r.value, s.value);
              case "scalar":
                return St(c.T, r.value, s.value);
            }
            throw new Error("oneof cannot contain ".concat(c.kind));
          case "map":
            const d = Object.keys(r).concat(Object.keys(s));
            switch (n.V.kind) {
              case "message":
                const l = n.V.T;
                return d.every((h) => l.equals(r[h], s[h]));
              case "enum":
                return d.every((h) => St(E.INT32, r[h], s[h]));
              case "scalar":
                const u = n.V.T;
                return d.every((h) => St(u, r[h], s[h]));
            }
            break;
        }
      });
    },
    // TODO use isFieldSet() here to support future field presence
    clone(i) {
      const e = i.getType(), t = new e(), n = t;
      for (const s of e.fields.byMember()) {
        const o = i[s.localName];
        let a;
        if (s.repeated)
          a = o.map(di);
        else if (s.kind == "map") {
          a = n[s.localName];
          for (const c of Object.entries(o)) {
            var r = L(c, 2);
            const d = r[0], l = r[1];
            a[d] = di(l);
          }
        } else s.kind == "oneof" ? a = s.findField(o.case) ? {
          case: o.case,
          value: di(o.value)
        } : {
          case: void 0
        } : a = di(o);
        n[s.localName] = a;
      }
      for (const s of e.runtime.bin.listUnknownFields(i))
        e.runtime.bin.onUnknownField(n, s.no, s.wireType, s.data);
      return t;
    }
  };
}
function di(i) {
  if (i === void 0)
    return i;
  if (pt(i))
    return i.clone();
  if (i instanceof Uint8Array) {
    const e = new Uint8Array(i.byteLength);
    return e.set(i), e;
  }
  return i;
}
function Rn(i) {
  return i instanceof Uint8Array ? i : new Uint8Array(i);
}
function ih(i, e, t) {
  return {
    syntax: i,
    json: Ku(),
    bin: Yu(),
    util: Object.assign(Object.assign({}, nh()), {
      newFieldList: e,
      initFields: t
    }),
    makeMessageType(n, r, s) {
      return Tu(this, n, r, s);
    },
    makeEnum: ku,
    makeEnumType: td,
    getEnumType: yu,
    makeExtension(n, r, s) {
      return Bu(this, n, r, s);
    }
  };
}
class rh {
  constructor(e, t) {
    this._fields = e, this._normalizer = t;
  }
  findJsonName(e) {
    if (!this.jsonNames) {
      const t = {};
      for (const n of this.list())
        t[n.jsonName] = t[n.name] = n;
      this.jsonNames = t;
    }
    return this.jsonNames[e];
  }
  find(e) {
    if (!this.numbers) {
      const t = {};
      for (const n of this.list())
        t[n.no] = n;
      this.numbers = t;
    }
    return this.numbers[e];
  }
  list() {
    return this.all || (this.all = this._normalizer(this._fields)), this.all;
  }
  byNumber() {
    return this.numbersAsc || (this.numbersAsc = this.list().concat().sort((e, t) => e.no - t.no)), this.numbersAsc;
  }
  byMember() {
    if (!this.members) {
      this.members = [];
      const e = this.members;
      let t;
      for (const n of this.list())
        n.oneof ? n.oneof !== t && (t = n.oneof, e.push(t)) : e.push(n);
    }
    return this.members;
  }
}
function gd(i, e) {
  const t = vd(i);
  return e ? t : lh(dh(t));
}
function sh(i) {
  return gd(i, !1);
}
const ah = vd;
function vd(i) {
  let e = !1;
  const t = [];
  for (let n = 0; n < i.length; n++) {
    let r = i.charAt(n);
    switch (r) {
      case "_":
        e = !0;
        break;
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        t.push(r), e = !1;
        break;
      default:
        e && (e = !1, r = r.toUpperCase()), t.push(r);
        break;
    }
  }
  return t.join("");
}
const oh = /* @__PURE__ */ new Set([
  // names reserved by JavaScript
  "constructor",
  "toString",
  "toJSON",
  "valueOf"
]), ch = /* @__PURE__ */ new Set([
  // names reserved by the runtime
  "getType",
  "clone",
  "equals",
  "fromBinary",
  "fromJson",
  "fromJsonString",
  "toBinary",
  "toJson",
  "toJsonString",
  // names reserved by the runtime for the future
  "toObject"
]), bd = (i) => "".concat(i, "$"), dh = (i) => ch.has(i) ? bd(i) : i, lh = (i) => oh.has(i) ? bd(i) : i;
class uh {
  constructor(e) {
    this.kind = "oneof", this.repeated = !1, this.packed = !1, this.opt = !1, this.req = !1, this.default = void 0, this.fields = [], this.name = e, this.localName = sh(e);
  }
  addField(e) {
    ie(e.oneof === this, "field ".concat(e.name, " not one of ").concat(this.name)), this.fields.push(e);
  }
  findField(e) {
    if (!this._lookup) {
      this._lookup = /* @__PURE__ */ Object.create(null);
      for (let t = 0; t < this.fields.length; t++)
        this._lookup[this.fields[t].localName] = this.fields[t];
    }
    return this._lookup[e];
  }
}
function hh(i, e) {
  var t, n, r, s, o, a;
  const c = [];
  let d;
  for (const l of typeof i == "function" ? i() : i) {
    const u = l;
    if (u.localName = gd(l.name, l.oneof !== void 0), u.jsonName = (t = l.jsonName) !== null && t !== void 0 ? t : ah(l.name), u.repeated = (n = l.repeated) !== null && n !== void 0 ? n : !1, l.kind == "scalar" && (u.L = (r = l.L) !== null && r !== void 0 ? r : Mt.BIGINT), u.delimited = (s = l.delimited) !== null && s !== void 0 ? s : !1, u.req = (o = l.req) !== null && o !== void 0 ? o : !1, u.opt = (a = l.opt) !== null && a !== void 0 ? a : !1, l.packed === void 0 && (u.packed = l.kind == "enum" || l.kind == "scalar" && l.T != E.BYTES && l.T != E.STRING), l.oneof !== void 0) {
      const h = typeof l.oneof == "string" ? l.oneof : l.oneof.name;
      (!d || d.name != h) && (d = new uh(h)), u.oneof = d, d.addField(u);
    }
    c.push(u);
  }
  return c;
}
const v = ih(
  "proto3",
  (i) => new rh(i, (e) => hh(e)),
  // TODO merge with proto2 and initExtensionField, also see initPartial, equals, clone
  (i) => {
    for (const e of i.getType().fields.byMember()) {
      if (e.opt)
        continue;
      const t = e.localName, n = i;
      if (e.repeated) {
        n[t] = [];
        continue;
      }
      switch (e.kind) {
        case "oneof":
          n[t] = {
            case: void 0
          };
          break;
        case "enum":
          n[t] = 0;
          break;
        case "map":
          n[t] = {};
          break;
        case "scalar":
          n[t] = yn(e.T, e.L);
          break;
      }
    }
  }
);
class Ie extends Fs {
  constructor(e) {
    super(), this.seconds = te.zero, this.nanos = 0, v.util.initPartial(e, this);
  }
  fromJson(e, t) {
    if (typeof e != "string")
      throw new Error("cannot decode google.protobuf.Timestamp from JSON: ".concat(v.json.debug(e)));
    const n = e.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:Z|\.([0-9]{3,9})Z|([+-][0-9][0-9]:[0-9][0-9]))$/);
    if (!n)
      throw new Error("cannot decode google.protobuf.Timestamp from JSON: invalid RFC 3339 string");
    const r = Date.parse(n[1] + "-" + n[2] + "-" + n[3] + "T" + n[4] + ":" + n[5] + ":" + n[6] + (n[8] ? n[8] : "Z"));
    if (Number.isNaN(r))
      throw new Error("cannot decode google.protobuf.Timestamp from JSON: invalid RFC 3339 string");
    if (r < Date.parse("0001-01-01T00:00:00Z") || r > Date.parse("9999-12-31T23:59:59Z"))
      throw new Error("cannot decode message google.protobuf.Timestamp from JSON: must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive");
    return this.seconds = te.parse(r / 1e3), this.nanos = 0, n[7] && (this.nanos = parseInt("1" + n[7] + "0".repeat(9 - n[7].length)) - 1e9), this;
  }
  toJson(e) {
    const t = Number(this.seconds) * 1e3;
    if (t < Date.parse("0001-01-01T00:00:00Z") || t > Date.parse("9999-12-31T23:59:59Z"))
      throw new Error("cannot encode google.protobuf.Timestamp to JSON: must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive");
    if (this.nanos < 0)
      throw new Error("cannot encode google.protobuf.Timestamp to JSON: nanos must not be negative");
    let n = "Z";
    if (this.nanos > 0) {
      const r = (this.nanos + 1e9).toString().substring(1);
      r.substring(3) === "000000" ? n = "." + r.substring(0, 3) + "Z" : r.substring(6) === "000" ? n = "." + r.substring(0, 6) + "Z" : n = "." + r + "Z";
    }
    return new Date(t).toISOString().replace(".000Z", n);
  }
  toDate() {
    return new Date(Number(this.seconds) * 1e3 + Math.ceil(this.nanos / 1e6));
  }
  static now() {
    return Ie.fromDate(/* @__PURE__ */ new Date());
  }
  static fromDate(e) {
    const t = e.getTime();
    return new Ie({
      seconds: te.parse(Math.floor(t / 1e3)),
      nanos: t % 1e3 * 1e6
    });
  }
  static fromBinary(e, t) {
    return new Ie().fromBinary(e, t);
  }
  static fromJson(e, t) {
    return new Ie().fromJson(e, t);
  }
  static fromJsonString(e, t) {
    return new Ie().fromJsonString(e, t);
  }
  static equals(e, t) {
    return v.util.equals(Ie, e, t);
  }
}
Ie.runtime = v;
Ie.typeName = "google.protobuf.Timestamp";
Ie.fields = v.util.newFieldList(() => [{
  no: 1,
  name: "seconds",
  kind: "scalar",
  T: 3
  /* ScalarType.INT64 */
}, {
  no: 2,
  name: "nanos",
  kind: "scalar",
  T: 5
  /* ScalarType.INT32 */
}]);
const fh = /* @__PURE__ */ v.makeMessageType("livekit.MetricsBatch", () => [{
  no: 1,
  name: "timestamp_ms",
  kind: "scalar",
  T: 3
  /* ScalarType.INT64 */
}, {
  no: 2,
  name: "normalized_timestamp",
  kind: "message",
  T: Ie
}, {
  no: 3,
  name: "str_data",
  kind: "scalar",
  T: 9,
  repeated: !0
}, {
  no: 4,
  name: "time_series",
  kind: "message",
  T: ph,
  repeated: !0
}, {
  no: 5,
  name: "events",
  kind: "message",
  T: gh,
  repeated: !0
}]), ph = /* @__PURE__ */ v.makeMessageType("livekit.TimeSeriesMetric", () => [{
  no: 1,
  name: "label",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 2,
  name: "participant_identity",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 3,
  name: "track_sid",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 4,
  name: "samples",
  kind: "message",
  T: mh,
  repeated: !0
}, {
  no: 5,
  name: "rid",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}]), mh = /* @__PURE__ */ v.makeMessageType("livekit.MetricSample", () => [{
  no: 1,
  name: "timestamp_ms",
  kind: "scalar",
  T: 3
  /* ScalarType.INT64 */
}, {
  no: 2,
  name: "normalized_timestamp",
  kind: "message",
  T: Ie
}, {
  no: 3,
  name: "value",
  kind: "scalar",
  T: 2
  /* ScalarType.FLOAT */
}]), gh = /* @__PURE__ */ v.makeMessageType("livekit.EventMetric", () => [{
  no: 1,
  name: "label",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 2,
  name: "participant_identity",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 3,
  name: "track_sid",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 4,
  name: "start_timestamp_ms",
  kind: "scalar",
  T: 3
  /* ScalarType.INT64 */
}, {
  no: 5,
  name: "end_timestamp_ms",
  kind: "scalar",
  T: 3,
  opt: !0
}, {
  no: 6,
  name: "normalized_start_timestamp",
  kind: "message",
  T: Ie
}, {
  no: 7,
  name: "normalized_end_timestamp",
  kind: "message",
  T: Ie,
  opt: !0
}, {
  no: 8,
  name: "metadata",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 9,
  name: "rid",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}]), yd = /* @__PURE__ */ v.makeEnum("livekit.BackupCodecPolicy", [{
  no: 0,
  name: "PREFER_REGRESSION"
}, {
  no: 1,
  name: "SIMULCAST"
}, {
  no: 2,
  name: "REGRESSION"
}]), Ke = /* @__PURE__ */ v.makeEnum("livekit.TrackType", [{
  no: 0,
  name: "AUDIO"
}, {
  no: 1,
  name: "VIDEO"
}, {
  no: 2,
  name: "DATA"
}]), de = /* @__PURE__ */ v.makeEnum("livekit.TrackSource", [{
  no: 0,
  name: "UNKNOWN"
}, {
  no: 1,
  name: "CAMERA"
}, {
  no: 2,
  name: "MICROPHONE"
}, {
  no: 3,
  name: "SCREEN_SHARE"
}, {
  no: 4,
  name: "SCREEN_SHARE_AUDIO"
}]), js = /* @__PURE__ */ v.makeEnum("livekit.VideoQuality", [{
  no: 0,
  name: "LOW"
}, {
  no: 1,
  name: "MEDIUM"
}, {
  no: 2,
  name: "HIGH"
}, {
  no: 3,
  name: "OFF"
}]), nn = /* @__PURE__ */ v.makeEnum("livekit.ConnectionQuality", [{
  no: 0,
  name: "POOR"
}, {
  no: 1,
  name: "GOOD"
}, {
  no: 2,
  name: "EXCELLENT"
}, {
  no: 3,
  name: "LOST"
}]), Kn = /* @__PURE__ */ v.makeEnum("livekit.ClientConfigSetting", [{
  no: 0,
  name: "UNSET"
}, {
  no: 1,
  name: "DISABLED"
}, {
  no: 2,
  name: "ENABLED"
}]), Le = /* @__PURE__ */ v.makeEnum("livekit.DisconnectReason", [{
  no: 0,
  name: "UNKNOWN_REASON"
}, {
  no: 1,
  name: "CLIENT_INITIATED"
}, {
  no: 2,
  name: "DUPLICATE_IDENTITY"
}, {
  no: 3,
  name: "SERVER_SHUTDOWN"
}, {
  no: 4,
  name: "PARTICIPANT_REMOVED"
}, {
  no: 5,
  name: "ROOM_DELETED"
}, {
  no: 6,
  name: "STATE_MISMATCH"
}, {
  no: 7,
  name: "JOIN_FAILURE"
}, {
  no: 8,
  name: "MIGRATION"
}, {
  no: 9,
  name: "SIGNAL_CLOSE"
}, {
  no: 10,
  name: "ROOM_CLOSED"
}, {
  no: 11,
  name: "USER_UNAVAILABLE"
}, {
  no: 12,
  name: "USER_REJECTED"
}, {
  no: 13,
  name: "SIP_TRUNK_FAILURE"
}, {
  no: 14,
  name: "CONNECTION_TIMEOUT"
}, {
  no: 15,
  name: "MEDIA_FAILURE"
}, {
  no: 16,
  name: "AGENT_ERROR"
}]), lt = /* @__PURE__ */ v.makeEnum("livekit.ReconnectReason", [{
  no: 0,
  name: "RR_UNKNOWN"
}, {
  no: 1,
  name: "RR_SIGNAL_DISCONNECTED"
}, {
  no: 2,
  name: "RR_PUBLISHER_FAILED"
}, {
  no: 3,
  name: "RR_SUBSCRIBER_FAILED"
}, {
  no: 4,
  name: "RR_SWITCH_CANDIDATE"
}]), vh = /* @__PURE__ */ v.makeEnum("livekit.SubscriptionError", [{
  no: 0,
  name: "SE_UNKNOWN"
}, {
  no: 1,
  name: "SE_CODEC_UNSUPPORTED"
}, {
  no: 2,
  name: "SE_TRACK_NOTFOUND"
}]), ge = /* @__PURE__ */ v.makeEnum("livekit.AudioTrackFeature", [{
  no: 0,
  name: "TF_STEREO"
}, {
  no: 1,
  name: "TF_NO_DTX"
}, {
  no: 2,
  name: "TF_AUTO_GAIN_CONTROL"
}, {
  no: 3,
  name: "TF_ECHO_CANCELLATION"
}, {
  no: 4,
  name: "TF_NOISE_SUPPRESSION"
}, {
  no: 5,
  name: "TF_ENHANCED_NOISE_CANCELLATION"
}, {
  no: 6,
  name: "TF_PRECONNECT_BUFFER"
}]), kn = /* @__PURE__ */ v.makeEnum("livekit.PacketTrailerFeature", [{
  no: 0,
  name: "PTF_USER_TIMESTAMP"
}, {
  no: 1,
  name: "PTF_FRAME_ID"
}, {
  no: 2,
  name: "PTF_USER_DATA"
}]), Ji = /* @__PURE__ */ v.makeMessageType("livekit.Room", () => [{
  no: 1,
  name: "sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "name",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "empty_timeout",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 14,
  name: "departure_timeout",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 4,
  name: "max_participants",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 5,
  name: "creation_time",
  kind: "scalar",
  T: 3
  /* ScalarType.INT64 */
}, {
  no: 15,
  name: "creation_time_ms",
  kind: "scalar",
  T: 3
  /* ScalarType.INT64 */
}, {
  no: 6,
  name: "turn_password",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 7,
  name: "enabled_codecs",
  kind: "message",
  T: Di,
  repeated: !0
}, {
  no: 8,
  name: "metadata",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 9,
  name: "num_participants",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 11,
  name: "num_publishers",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 10,
  name: "active_recording",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 13,
  name: "version",
  kind: "message",
  T: Od
}]), Di = /* @__PURE__ */ v.makeMessageType("livekit.Codec", () => [{
  no: 1,
  name: "mime",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "fmtp_line",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}]), bh = /* @__PURE__ */ v.makeMessageType("livekit.ParticipantPermission", () => [{
  no: 1,
  name: "can_subscribe",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 2,
  name: "can_publish",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 3,
  name: "can_publish_data",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 9,
  name: "can_publish_sources",
  kind: "enum",
  T: v.getEnumType(de),
  repeated: !0
}, {
  no: 7,
  name: "hidden",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 8,
  name: "recorder",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 10,
  name: "can_update_metadata",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 11,
  name: "agent",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 12,
  name: "can_subscribe_metrics",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 13,
  name: "can_manage_agent_session",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}]), Kt = /* @__PURE__ */ v.makeMessageType("livekit.ParticipantInfo", () => [{
  no: 1,
  name: "sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "identity",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "state",
  kind: "enum",
  T: v.getEnumType(on)
}, {
  no: 4,
  name: "tracks",
  kind: "message",
  T: rn,
  repeated: !0
}, {
  no: 5,
  name: "metadata",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 6,
  name: "joined_at",
  kind: "scalar",
  T: 3
  /* ScalarType.INT64 */
}, {
  no: 17,
  name: "joined_at_ms",
  kind: "scalar",
  T: 3
  /* ScalarType.INT64 */
}, {
  no: 9,
  name: "name",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 10,
  name: "version",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 11,
  name: "permission",
  kind: "message",
  T: bh
}, {
  no: 12,
  name: "region",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 13,
  name: "is_publisher",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 14,
  name: "kind",
  kind: "enum",
  T: v.getEnumType(Gn)
}, {
  no: 15,
  name: "attributes",
  kind: "map",
  K: 9,
  V: {
    kind: "scalar",
    T: 9
    /* ScalarType.STRING */
  }
}, {
  no: 16,
  name: "disconnect_reason",
  kind: "enum",
  T: v.getEnumType(Le)
}, {
  no: 18,
  name: "kind_details",
  kind: "enum",
  T: v.getEnumType(yh),
  repeated: !0
}, {
  no: 19,
  name: "data_tracks",
  kind: "message",
  T: $i,
  repeated: !0
}, {
  no: 20,
  name: "client_protocol",
  kind: "scalar",
  T: 5
  /* ScalarType.INT32 */
}, {
  no: 21,
  name: "capabilities",
  kind: "enum",
  T: v.getEnumType(Jn),
  repeated: !0
}]), on = /* @__PURE__ */ v.makeEnum("livekit.ParticipantInfo.State", [{
  no: 0,
  name: "JOINING"
}, {
  no: 1,
  name: "JOINED"
}, {
  no: 2,
  name: "ACTIVE"
}, {
  no: 3,
  name: "DISCONNECTED"
}]), Gn = /* @__PURE__ */ v.makeEnum("livekit.ParticipantInfo.Kind", [{
  no: 0,
  name: "STANDARD"
}, {
  no: 1,
  name: "INGRESS"
}, {
  no: 2,
  name: "EGRESS"
}, {
  no: 3,
  name: "SIP"
}, {
  no: 4,
  name: "AGENT"
}, {
  no: 7,
  name: "CONNECTOR"
}, {
  no: 8,
  name: "BRIDGE"
}]), yh = /* @__PURE__ */ v.makeEnum("livekit.ParticipantInfo.KindDetail", [{
  no: 0,
  name: "CLOUD_AGENT"
}, {
  no: 1,
  name: "FORWARDED"
}, {
  no: 2,
  name: "CONNECTOR_WHATSAPP"
}, {
  no: 3,
  name: "CONNECTOR_TWILIO"
}, {
  no: 4,
  name: "BRIDGE_RTSP"
}, {
  no: 5,
  name: "SIMULATION"
}]), H = /* @__PURE__ */ v.makeEnum("livekit.Encryption.Type", [{
  no: 0,
  name: "NONE"
}, {
  no: 1,
  name: "GCM"
}, {
  no: 2,
  name: "CUSTOM"
}]), kh = /* @__PURE__ */ v.makeMessageType("livekit.SimulcastCodecInfo", () => [{
  no: 1,
  name: "mime_type",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "mid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "cid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 4,
  name: "layers",
  kind: "message",
  T: Rt,
  repeated: !0
}, {
  no: 5,
  name: "video_layer_mode",
  kind: "enum",
  T: v.getEnumType(Ws)
}, {
  no: 6,
  name: "sdp_cid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}]), rn = /* @__PURE__ */ v.makeMessageType("livekit.TrackInfo", () => [{
  no: 1,
  name: "sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "type",
  kind: "enum",
  T: v.getEnumType(Ke)
}, {
  no: 3,
  name: "name",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 4,
  name: "muted",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 5,
  name: "width",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 6,
  name: "height",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 7,
  name: "simulcast",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 8,
  name: "disable_dtx",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 9,
  name: "source",
  kind: "enum",
  T: v.getEnumType(de)
}, {
  no: 10,
  name: "layers",
  kind: "message",
  T: Rt,
  repeated: !0
}, {
  no: 11,
  name: "mime_type",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 12,
  name: "mid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 13,
  name: "codecs",
  kind: "message",
  T: kh,
  repeated: !0
}, {
  no: 14,
  name: "stereo",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 15,
  name: "disable_red",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 16,
  name: "encryption",
  kind: "enum",
  T: v.getEnumType(H)
}, {
  no: 17,
  name: "stream",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 18,
  name: "version",
  kind: "message",
  T: Od
}, {
  no: 19,
  name: "audio_features",
  kind: "enum",
  T: v.getEnumType(ge),
  repeated: !0
}, {
  no: 20,
  name: "backup_codec_policy",
  kind: "enum",
  T: v.getEnumType(yd)
}, {
  no: 21,
  name: "packet_trailer_features",
  kind: "enum",
  T: v.getEnumType(kn),
  repeated: !0
}]), $i = /* @__PURE__ */ v.makeMessageType("livekit.DataTrackInfo", () => [{
  no: 1,
  name: "pub_handle",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 2,
  name: "sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "name",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 4,
  name: "encryption",
  kind: "enum",
  T: v.getEnumType(H)
}, {
  no: 5,
  name: "frame_encoding",
  kind: "message",
  T: kd,
  opt: !0
}, {
  no: 6,
  name: "schema",
  kind: "message",
  T: qs,
  opt: !0
}]), kd = /* @__PURE__ */ v.makeMessageType("livekit.DataTrackFrameEncoding", () => [{
  no: 1,
  name: "well_known",
  kind: "enum",
  T: v.getEnumType(Th),
  oneof: "value"
}, {
  no: 2,
  name: "custom",
  kind: "scalar",
  T: 9,
  oneof: "value"
}]), Th = /* @__PURE__ */ v.makeEnum("livekit.DataTrackFrameEncoding.WellKnownFrameEncoding", [{
  no: 0,
  name: "WELL_KNOWN_FRAME_ENCODING_UNSPECIFIED",
  localName: "UNSPECIFIED"
}, {
  no: 1,
  name: "WELL_KNOWN_FRAME_ENCODING_ROS1",
  localName: "ROS1"
}, {
  no: 2,
  name: "WELL_KNOWN_FRAME_ENCODING_CDR",
  localName: "CDR"
}, {
  no: 3,
  name: "WELL_KNOWN_FRAME_ENCODING_PROTOBUF",
  localName: "PROTOBUF"
}, {
  no: 4,
  name: "WELL_KNOWN_FRAME_ENCODING_FLATBUFFER",
  localName: "FLATBUFFER"
}, {
  no: 5,
  name: "WELL_KNOWN_FRAME_ENCODING_CBOR",
  localName: "CBOR"
}, {
  no: 6,
  name: "WELL_KNOWN_FRAME_ENCODING_MSGPACK",
  localName: "MSGPACK"
}, {
  no: 7,
  name: "WELL_KNOWN_FRAME_ENCODING_JSON",
  localName: "JSON"
}]), Sh = /* @__PURE__ */ v.makeMessageType("livekit.DataTrackSchemaEncoding", () => [{
  no: 1,
  name: "well_known",
  kind: "enum",
  T: v.getEnumType(Ch),
  oneof: "value"
}, {
  no: 2,
  name: "custom",
  kind: "scalar",
  T: 9,
  oneof: "value"
}]), Ch = /* @__PURE__ */ v.makeEnum("livekit.DataTrackSchemaEncoding.WellKnownSchemaEncoding", [{
  no: 0,
  name: "WELL_KNOWN_SCHEMA_ENCODING_UNSPECIFIED",
  localName: "UNSPECIFIED"
}, {
  no: 1,
  name: "WELL_KNOWN_SCHEMA_ENCODING_PROTOBUF",
  localName: "PROTOBUF"
}, {
  no: 2,
  name: "WELL_KNOWN_SCHEMA_ENCODING_FLATBUFFER",
  localName: "FLATBUFFER"
}, {
  no: 3,
  name: "WELL_KNOWN_SCHEMA_ENCODING_ROS1_MSG",
  localName: "ROS1_MSG"
}, {
  no: 4,
  name: "WELL_KNOWN_SCHEMA_ENCODING_ROS2_MSG",
  localName: "ROS2_MSG"
}, {
  no: 5,
  name: "WELL_KNOWN_SCHEMA_ENCODING_ROS2_IDL",
  localName: "ROS2_IDL"
}, {
  no: 6,
  name: "WELL_KNOWN_SCHEMA_ENCODING_OMG_IDL",
  localName: "OMG_IDL"
}, {
  no: 7,
  name: "WELL_KNOWN_SCHEMA_ENCODING_JSON_SCHEMA",
  localName: "JSON_SCHEMA"
}]), qs = /* @__PURE__ */ v.makeMessageType("livekit.DataTrackSchemaId", () => [{
  no: 1,
  name: "name",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "encoding",
  kind: "message",
  T: Sh
}]), wh = /* @__PURE__ */ v.makeMessageType("livekit.DataTrackSubscriptionOptions", () => [{
  no: 1,
  name: "target_fps",
  kind: "scalar",
  T: 13,
  opt: !0
}]), Vs = /* @__PURE__ */ v.makeMessageType("livekit.DataBlobKey", () => [{
  no: 1,
  name: "generic",
  kind: "scalar",
  T: 9,
  oneof: "key"
}, {
  no: 2,
  name: "schema_id",
  kind: "message",
  T: qs,
  oneof: "key"
}]), Td = /* @__PURE__ */ v.makeMessageType("livekit.DataBlob", () => [{
  no: 1,
  name: "key",
  kind: "message",
  T: Vs
}, {
  no: 2,
  name: "contents",
  kind: "scalar",
  T: 12
  /* ScalarType.BYTES */
}]), Rt = /* @__PURE__ */ v.makeMessageType("livekit.VideoLayer", () => [{
  no: 1,
  name: "quality",
  kind: "enum",
  T: v.getEnumType(js)
}, {
  no: 2,
  name: "width",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 3,
  name: "height",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 4,
  name: "bitrate",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 5,
  name: "ssrc",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 6,
  name: "spatial_layer",
  kind: "scalar",
  T: 5
  /* ScalarType.INT32 */
}, {
  no: 7,
  name: "rid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 8,
  name: "repair_ssrc",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}]), Ws = /* @__PURE__ */ v.makeEnum("livekit.VideoLayer.Mode", [{
  no: 0,
  name: "MODE_UNUSED"
}, {
  no: 1,
  name: "ONE_SPATIAL_LAYER_PER_STREAM"
}, {
  no: 2,
  name: "MULTIPLE_SPATIAL_LAYERS_PER_STREAM"
}, {
  no: 3,
  name: "ONE_SPATIAL_LAYER_PER_STREAM_INCOMPLETE_RTCP_SR"
}]), Ae = /* @__PURE__ */ v.makeMessageType("livekit.DataPacket", () => [{
  no: 1,
  name: "kind",
  kind: "enum",
  T: v.getEnumType(It)
}, {
  no: 4,
  name: "participant_identity",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 5,
  name: "destination_identities",
  kind: "scalar",
  T: 9,
  repeated: !0
}, {
  no: 2,
  name: "user",
  kind: "message",
  T: Hs,
  oneof: "value"
}, {
  no: 3,
  name: "speaker",
  kind: "message",
  T: Eh,
  oneof: "value"
}, {
  no: 6,
  name: "sip_dtmf",
  kind: "message",
  T: Ed,
  oneof: "value"
}, {
  no: 7,
  name: "transcription",
  kind: "message",
  T: _h,
  oneof: "value"
}, {
  no: 8,
  name: "metrics",
  kind: "message",
  T: fh,
  oneof: "value"
}, {
  no: 9,
  name: "chat_message",
  kind: "message",
  T: zs,
  oneof: "value"
}, {
  no: 10,
  name: "rpc_request",
  kind: "message",
  T: Ks,
  oneof: "value"
}, {
  no: 11,
  name: "rpc_ack",
  kind: "message",
  T: Qi,
  oneof: "value"
}, {
  no: 12,
  name: "rpc_response",
  kind: "message",
  T: Gs,
  oneof: "value"
}, {
  no: 13,
  name: "stream_header",
  kind: "message",
  T: Yi,
  oneof: "value"
}, {
  no: 14,
  name: "stream_chunk",
  kind: "message",
  T: vt,
  oneof: "value"
}, {
  no: 15,
  name: "stream_trailer",
  kind: "message",
  T: Js,
  oneof: "value"
}, {
  no: 18,
  name: "encrypted_packet",
  kind: "message",
  T: Sd,
  oneof: "value"
}, {
  no: 16,
  name: "sequence",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 17,
  name: "participant_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}]), It = /* @__PURE__ */ v.makeEnum("livekit.DataPacket.Kind", [{
  no: 0,
  name: "RELIABLE"
}, {
  no: 1,
  name: "LOSSY"
}]), Sd = /* @__PURE__ */ v.makeMessageType("livekit.EncryptedPacket", () => [{
  no: 1,
  name: "encryption_type",
  kind: "enum",
  T: v.getEnumType(H)
}, {
  no: 2,
  name: "iv",
  kind: "scalar",
  T: 12
  /* ScalarType.BYTES */
}, {
  no: 3,
  name: "key_index",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 4,
  name: "encrypted_value",
  kind: "scalar",
  T: 12
  /* ScalarType.BYTES */
}]), Cd = /* @__PURE__ */ v.makeMessageType("livekit.EncryptedPacketPayload", () => [{
  no: 1,
  name: "user",
  kind: "message",
  T: Hs,
  oneof: "value"
}, {
  no: 3,
  name: "chat_message",
  kind: "message",
  T: zs,
  oneof: "value"
}, {
  no: 4,
  name: "rpc_request",
  kind: "message",
  T: Ks,
  oneof: "value"
}, {
  no: 5,
  name: "rpc_ack",
  kind: "message",
  T: Qi,
  oneof: "value"
}, {
  no: 6,
  name: "rpc_response",
  kind: "message",
  T: Gs,
  oneof: "value"
}, {
  no: 7,
  name: "stream_header",
  kind: "message",
  T: Yi,
  oneof: "value"
}, {
  no: 8,
  name: "stream_chunk",
  kind: "message",
  T: vt,
  oneof: "value"
}, {
  no: 9,
  name: "stream_trailer",
  kind: "message",
  T: Js,
  oneof: "value"
}]), Eh = /* @__PURE__ */ v.makeMessageType("livekit.ActiveSpeakerUpdate", () => [{
  no: 1,
  name: "speakers",
  kind: "message",
  T: wd,
  repeated: !0
}]), wd = /* @__PURE__ */ v.makeMessageType("livekit.SpeakerInfo", () => [{
  no: 1,
  name: "sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "level",
  kind: "scalar",
  T: 2
  /* ScalarType.FLOAT */
}, {
  no: 3,
  name: "active",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}]), Hs = /* @__PURE__ */ v.makeMessageType("livekit.UserPacket", () => [{
  no: 1,
  name: "participant_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 5,
  name: "participant_identity",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "payload",
  kind: "scalar",
  T: 12
  /* ScalarType.BYTES */
}, {
  no: 3,
  name: "destination_sids",
  kind: "scalar",
  T: 9,
  repeated: !0
}, {
  no: 6,
  name: "destination_identities",
  kind: "scalar",
  T: 9,
  repeated: !0
}, {
  no: 4,
  name: "topic",
  kind: "scalar",
  T: 9,
  opt: !0
}, {
  no: 8,
  name: "id",
  kind: "scalar",
  T: 9,
  opt: !0
}, {
  no: 9,
  name: "start_time",
  kind: "scalar",
  T: 4,
  opt: !0
}, {
  no: 10,
  name: "end_time",
  kind: "scalar",
  T: 4,
  opt: !0
}, {
  no: 11,
  name: "nonce",
  kind: "scalar",
  T: 12
  /* ScalarType.BYTES */
}]), Ed = /* @__PURE__ */ v.makeMessageType("livekit.SipDTMF", () => [{
  no: 3,
  name: "code",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 4,
  name: "digit",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}]), _h = /* @__PURE__ */ v.makeMessageType("livekit.Transcription", () => [{
  no: 2,
  name: "transcribed_participant_identity",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "track_id",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 4,
  name: "segments",
  kind: "message",
  T: Ph,
  repeated: !0
}]), Ph = /* @__PURE__ */ v.makeMessageType("livekit.TranscriptionSegment", () => [{
  no: 1,
  name: "id",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "text",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "start_time",
  kind: "scalar",
  T: 4
  /* ScalarType.UINT64 */
}, {
  no: 4,
  name: "end_time",
  kind: "scalar",
  T: 4
  /* ScalarType.UINT64 */
}, {
  no: 5,
  name: "final",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 6,
  name: "language",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}]), zs = /* @__PURE__ */ v.makeMessageType("livekit.ChatMessage", () => [{
  no: 1,
  name: "id",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "timestamp",
  kind: "scalar",
  T: 3
  /* ScalarType.INT64 */
}, {
  no: 3,
  name: "edit_timestamp",
  kind: "scalar",
  T: 3,
  opt: !0
}, {
  no: 4,
  name: "message",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 5,
  name: "deleted",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 6,
  name: "generated",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}]), Ks = /* @__PURE__ */ v.makeMessageType("livekit.RpcRequest", () => [{
  no: 1,
  name: "id",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "method",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "payload",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 4,
  name: "response_timeout_ms",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 5,
  name: "version",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 6,
  name: "compressed_payload",
  kind: "scalar",
  T: 12
  /* ScalarType.BYTES */
}]), Qi = /* @__PURE__ */ v.makeMessageType("livekit.RpcAck", () => [{
  no: 1,
  name: "request_id",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}]), Gs = /* @__PURE__ */ v.makeMessageType("livekit.RpcResponse", () => [{
  no: 1,
  name: "request_id",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "payload",
  kind: "scalar",
  T: 9,
  oneof: "value"
}, {
  no: 3,
  name: "error",
  kind: "message",
  T: _d,
  oneof: "value"
}, {
  no: 4,
  name: "compressed_payload",
  kind: "scalar",
  T: 12,
  oneof: "value"
}]), _d = /* @__PURE__ */ v.makeMessageType("livekit.RpcError", () => [{
  no: 1,
  name: "code",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 2,
  name: "message",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "data",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}]), Pd = /* @__PURE__ */ v.makeMessageType("livekit.ParticipantTracks", () => [{
  no: 1,
  name: "participant_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "track_sids",
  kind: "scalar",
  T: 9,
  repeated: !0
}]), Rd = /* @__PURE__ */ v.makeMessageType("livekit.ServerInfo", () => [{
  no: 1,
  name: "edition",
  kind: "enum",
  T: v.getEnumType(Id)
}, {
  no: 2,
  name: "version",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "protocol",
  kind: "scalar",
  T: 5
  /* ScalarType.INT32 */
}, {
  no: 4,
  name: "region",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 5,
  name: "node_id",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 6,
  name: "debug_info",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 7,
  name: "agent_protocol",
  kind: "scalar",
  T: 5
  /* ScalarType.INT32 */
}]), Id = /* @__PURE__ */ v.makeEnum("livekit.ServerInfo.Edition", [{
  no: 0,
  name: "Standard"
}, {
  no: 1,
  name: "Cloud"
}]), Ad = /* @__PURE__ */ v.makeMessageType("livekit.ClientInfo", () => [{
  no: 1,
  name: "sdk",
  kind: "enum",
  T: v.getEnumType(xd)
}, {
  no: 2,
  name: "version",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "protocol",
  kind: "scalar",
  T: 5
  /* ScalarType.INT32 */
}, {
  no: 4,
  name: "os",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 5,
  name: "os_version",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 6,
  name: "device_model",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 7,
  name: "browser",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 8,
  name: "browser_version",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 9,
  name: "address",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 10,
  name: "network",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 11,
  name: "other_sdks",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 12,
  name: "client_protocol",
  kind: "scalar",
  T: 5
  /* ScalarType.INT32 */
}, {
  no: 13,
  name: "capabilities",
  kind: "enum",
  T: v.getEnumType(Jn),
  repeated: !0
}]), xd = /* @__PURE__ */ v.makeEnum("livekit.ClientInfo.SDK", [{
  no: 0,
  name: "UNKNOWN"
}, {
  no: 1,
  name: "JS"
}, {
  no: 2,
  name: "SWIFT"
}, {
  no: 3,
  name: "ANDROID"
}, {
  no: 4,
  name: "FLUTTER"
}, {
  no: 5,
  name: "GO"
}, {
  no: 6,
  name: "UNITY"
}, {
  no: 7,
  name: "REACT_NATIVE"
}, {
  no: 8,
  name: "RUST"
}, {
  no: 9,
  name: "PYTHON"
}, {
  no: 10,
  name: "CPP"
}, {
  no: 11,
  name: "UNITY_WEB"
}, {
  no: 12,
  name: "NODE"
}, {
  no: 13,
  name: "UNREAL"
}, {
  no: 14,
  name: "ESP32"
}, {
  no: 15,
  name: "DOTNET"
}]), Jn = /* @__PURE__ */ v.makeEnum("livekit.ClientInfo.Capability", [{
  no: 0,
  name: "CAP_UNUSED"
}, {
  no: 1,
  name: "CAP_PACKET_TRAILER"
}, {
  no: 2,
  name: "CAP_COMPRESSION_DEFLATE_RAW"
}]), Md = /* @__PURE__ */ v.makeMessageType("livekit.ClientConfiguration", () => [{
  no: 1,
  name: "video",
  kind: "message",
  T: no
}, {
  no: 2,
  name: "screen",
  kind: "message",
  T: no
}, {
  no: 3,
  name: "resume_connection",
  kind: "enum",
  T: v.getEnumType(Kn)
}, {
  no: 4,
  name: "disabled_codecs",
  kind: "message",
  T: Rh
}, {
  no: 5,
  name: "force_relay",
  kind: "enum",
  T: v.getEnumType(Kn)
}]), no = /* @__PURE__ */ v.makeMessageType("livekit.VideoConfiguration", () => [{
  no: 1,
  name: "hardware_encoder",
  kind: "enum",
  T: v.getEnumType(Kn)
}]), Rh = /* @__PURE__ */ v.makeMessageType("livekit.DisabledCodecs", () => [{
  no: 1,
  name: "codecs",
  kind: "message",
  T: Di,
  repeated: !0
}, {
  no: 2,
  name: "publish",
  kind: "message",
  T: Di,
  repeated: !0
}]), Od = /* @__PURE__ */ v.makeMessageType("livekit.TimedVersion", () => [{
  no: 1,
  name: "unix_micro",
  kind: "scalar",
  T: 3
  /* ScalarType.INT64 */
}, {
  no: 2,
  name: "ticks",
  kind: "scalar",
  T: 5
  /* ScalarType.INT32 */
}]), is = /* @__PURE__ */ v.makeEnum("livekit.DataStream.OperationType", [{
  no: 0,
  name: "CREATE"
}, {
  no: 1,
  name: "UPDATE"
}, {
  no: 2,
  name: "DELETE"
}, {
  no: 3,
  name: "REACTION"
}]), Se = /* @__PURE__ */ v.makeEnum("livekit.DataStream.CompressionType", [{
  no: 0,
  name: "NONE"
}, {
  no: 1,
  name: "DEFLATE_RAW"
}]), Ld = /* @__PURE__ */ v.makeMessageType("livekit.DataStream.TextHeader", () => [{
  no: 1,
  name: "operation_type",
  kind: "enum",
  T: v.getEnumType(is)
}, {
  no: 2,
  name: "version",
  kind: "scalar",
  T: 5
  /* ScalarType.INT32 */
}, {
  no: 3,
  name: "reply_to_stream_id",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 4,
  name: "attached_stream_ids",
  kind: "scalar",
  T: 9,
  repeated: !0
}, {
  no: 5,
  name: "generated",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}], {
  localName: "DataStream_TextHeader"
}), Dd = /* @__PURE__ */ v.makeMessageType("livekit.DataStream.ByteHeader", () => [{
  no: 1,
  name: "name",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}], {
  localName: "DataStream_ByteHeader"
}), Yi = /* @__PURE__ */ v.makeMessageType("livekit.DataStream.Header", () => [{
  no: 1,
  name: "stream_id",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "timestamp",
  kind: "scalar",
  T: 3
  /* ScalarType.INT64 */
}, {
  no: 3,
  name: "topic",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 4,
  name: "mime_type",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 5,
  name: "total_length",
  kind: "scalar",
  T: 4,
  opt: !0
}, {
  no: 7,
  name: "encryption_type",
  kind: "enum",
  T: v.getEnumType(H)
}, {
  no: 8,
  name: "attributes",
  kind: "map",
  K: 9,
  V: {
    kind: "scalar",
    T: 9
    /* ScalarType.STRING */
  }
}, {
  no: 9,
  name: "text_header",
  kind: "message",
  T: Ld,
  oneof: "content_header"
}, {
  no: 10,
  name: "byte_header",
  kind: "message",
  T: Dd,
  oneof: "content_header"
}, {
  no: 11,
  name: "inline_content",
  kind: "scalar",
  T: 12,
  opt: !0
}, {
  no: 12,
  name: "compression",
  kind: "enum",
  T: v.getEnumType(Se)
}], {
  localName: "DataStream_Header"
}), vt = /* @__PURE__ */ v.makeMessageType("livekit.DataStream.Chunk", () => [{
  no: 1,
  name: "stream_id",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "chunk_index",
  kind: "scalar",
  T: 4
  /* ScalarType.UINT64 */
}, {
  no: 3,
  name: "content",
  kind: "scalar",
  T: 12
  /* ScalarType.BYTES */
}, {
  no: 4,
  name: "version",
  kind: "scalar",
  T: 5
  /* ScalarType.INT32 */
}, {
  no: 5,
  name: "iv",
  kind: "scalar",
  T: 12,
  opt: !0
}], {
  localName: "DataStream_Chunk"
}), Js = /* @__PURE__ */ v.makeMessageType("livekit.DataStream.Trailer", () => [{
  no: 1,
  name: "stream_id",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "reason",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "attributes",
  kind: "map",
  K: 9,
  V: {
    kind: "scalar",
    T: 9
    /* ScalarType.STRING */
  }
}], {
  localName: "DataStream_Trailer"
}), Ih = /* @__PURE__ */ v.makeMessageType("livekit.SubscribedAudioCodec", () => [{
  no: 1,
  name: "codec",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "enabled",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}]), Oe = /* @__PURE__ */ v.makeEnum("livekit.SignalTarget", [{
  no: 0,
  name: "PUBLISHER"
}, {
  no: 1,
  name: "SUBSCRIBER"
}]), rs = /* @__PURE__ */ v.makeEnum("livekit.StreamState", [{
  no: 0,
  name: "ACTIVE"
}, {
  no: 1,
  name: "PAUSED"
}]), vr = /* @__PURE__ */ v.makeEnum("livekit.NegotiatedDataChannelID", [{
  no: 0,
  name: "NDCI_INVALID"
}, {
  no: 100,
  name: "NDCI_RELIABLE"
}, {
  no: 101,
  name: "NDCI_LOSSY"
}, {
  no: 102,
  name: "NDCI_DATA_TRACK"
}]), Ah = /* @__PURE__ */ v.makeEnum("livekit.CandidateProtocol", [{
  no: 0,
  name: "UDP"
}, {
  no: 1,
  name: "TCP"
}, {
  no: 2,
  name: "TLS"
}]), xh = /* @__PURE__ */ v.makeMessageType("livekit.SignalRequest", () => [{
  no: 1,
  name: "offer",
  kind: "message",
  T: Ot,
  oneof: "message"
}, {
  no: 2,
  name: "answer",
  kind: "message",
  T: Ot,
  oneof: "message"
}, {
  no: 3,
  name: "trickle",
  kind: "message",
  T: Xi,
  oneof: "message"
}, {
  no: 4,
  name: "add_track",
  kind: "message",
  T: si,
  oneof: "message"
}, {
  no: 5,
  name: "mute",
  kind: "message",
  T: Zi,
  oneof: "message"
}, {
  no: 6,
  name: "subscription",
  kind: "message",
  T: er,
  oneof: "message"
}, {
  no: 7,
  name: "track_setting",
  kind: "message",
  T: Ud,
  oneof: "message"
}, {
  no: 8,
  name: "leave",
  kind: "message",
  T: tr,
  oneof: "message"
}, {
  no: 10,
  name: "update_layers",
  kind: "message",
  T: Bd,
  oneof: "message"
}, {
  no: 11,
  name: "subscription_permission",
  kind: "message",
  T: Vd,
  oneof: "message"
}, {
  no: 12,
  name: "sync_state",
  kind: "message",
  T: ia,
  oneof: "message"
}, {
  no: 13,
  name: "simulate",
  kind: "message",
  T: Xe,
  oneof: "message"
}, {
  no: 14,
  name: "ping",
  kind: "scalar",
  T: 3,
  oneof: "message"
}, {
  no: 15,
  name: "update_metadata",
  kind: "message",
  T: ta,
  oneof: "message"
}, {
  no: 16,
  name: "ping_req",
  kind: "message",
  T: zd,
  oneof: "message"
}, {
  no: 17,
  name: "update_audio_track",
  kind: "message",
  T: ea,
  oneof: "message"
}, {
  no: 18,
  name: "update_video_track",
  kind: "message",
  T: Fd,
  oneof: "message"
}, {
  no: 19,
  name: "publish_data_track_request",
  kind: "message",
  T: $s,
  oneof: "message"
}, {
  no: 20,
  name: "unpublish_data_track_request",
  kind: "message",
  T: Ys,
  oneof: "message"
}, {
  no: 21,
  name: "update_data_subscription",
  kind: "message",
  T: Zs,
  oneof: "message"
}, {
  no: 22,
  name: "store_data_blob_request",
  kind: "message",
  T: Bh,
  oneof: "message"
}, {
  no: 23,
  name: "get_data_blob_request",
  kind: "message",
  T: qh,
  oneof: "message"
}]), io = /* @__PURE__ */ v.makeMessageType("livekit.SignalResponse", () => [{
  no: 1,
  name: "join",
  kind: "message",
  T: Dh,
  oneof: "message"
}, {
  no: 2,
  name: "answer",
  kind: "message",
  T: Ot,
  oneof: "message"
}, {
  no: 3,
  name: "offer",
  kind: "message",
  T: Ot,
  oneof: "message"
}, {
  no: 4,
  name: "trickle",
  kind: "message",
  T: Xi,
  oneof: "message"
}, {
  no: 5,
  name: "update",
  kind: "message",
  T: Fh,
  oneof: "message"
}, {
  no: 6,
  name: "track_published",
  kind: "message",
  T: Xs,
  oneof: "message"
}, {
  no: 8,
  name: "leave",
  kind: "message",
  T: tr,
  oneof: "message"
}, {
  no: 9,
  name: "mute",
  kind: "message",
  T: Zi,
  oneof: "message"
}, {
  no: 10,
  name: "speakers_changed",
  kind: "message",
  T: Wh,
  oneof: "message"
}, {
  no: 11,
  name: "room_update",
  kind: "message",
  T: Hh,
  oneof: "message"
}, {
  no: 12,
  name: "connection_quality",
  kind: "message",
  T: Kh,
  oneof: "message"
}, {
  no: 13,
  name: "stream_state_update",
  kind: "message",
  T: Jh,
  oneof: "message"
}, {
  no: 14,
  name: "subscribed_quality_update",
  kind: "message",
  T: Qh,
  oneof: "message"
}, {
  no: 15,
  name: "subscription_permission_update",
  kind: "message",
  T: Xh,
  oneof: "message"
}, {
  no: 16,
  name: "refresh_token",
  kind: "scalar",
  T: 9,
  oneof: "message"
}, {
  no: 17,
  name: "track_unpublished",
  kind: "message",
  T: Uh,
  oneof: "message"
}, {
  no: 18,
  name: "pong",
  kind: "scalar",
  T: 3,
  oneof: "message"
}, {
  no: 19,
  name: "reconnect",
  kind: "message",
  T: Nh,
  oneof: "message"
}, {
  no: 20,
  name: "pong_resp",
  kind: "message",
  T: ef,
  oneof: "message"
}, {
  no: 21,
  name: "subscription_response",
  kind: "message",
  T: rf,
  oneof: "message"
}, {
  no: 22,
  name: "request_response",
  kind: "message",
  T: sf,
  oneof: "message"
}, {
  no: 23,
  name: "track_subscribed",
  kind: "message",
  T: af,
  oneof: "message"
}, {
  no: 24,
  name: "room_moved",
  kind: "message",
  T: Zh,
  oneof: "message"
}, {
  no: 25,
  name: "media_sections_requirement",
  kind: "message",
  T: df,
  oneof: "message"
}, {
  no: 26,
  name: "subscribed_audio_codec_update",
  kind: "message",
  T: Yh,
  oneof: "message"
}, {
  no: 27,
  name: "publish_data_track_response",
  kind: "message",
  T: Qs,
  oneof: "message"
}, {
  no: 28,
  name: "unpublish_data_track_response",
  kind: "message",
  T: Mh,
  oneof: "message"
}, {
  no: 29,
  name: "data_track_subscriber_handles",
  kind: "message",
  T: Oh,
  oneof: "message"
}, {
  no: 30,
  name: "store_data_blob_response",
  kind: "message",
  T: jh,
  oneof: "message"
}, {
  no: 31,
  name: "get_data_blob_response",
  kind: "message",
  T: Vh,
  oneof: "message"
}]), ss = /* @__PURE__ */ v.makeMessageType("livekit.SimulcastCodec", () => [{
  no: 1,
  name: "codec",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "cid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 4,
  name: "layers",
  kind: "message",
  T: Rt,
  repeated: !0
}, {
  no: 5,
  name: "video_layer_mode",
  kind: "enum",
  T: v.getEnumType(Ws)
}]), si = /* @__PURE__ */ v.makeMessageType("livekit.AddTrackRequest", () => [{
  no: 1,
  name: "cid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "name",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "type",
  kind: "enum",
  T: v.getEnumType(Ke)
}, {
  no: 4,
  name: "width",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 5,
  name: "height",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 6,
  name: "muted",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 7,
  name: "disable_dtx",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 8,
  name: "source",
  kind: "enum",
  T: v.getEnumType(de)
}, {
  no: 9,
  name: "layers",
  kind: "message",
  T: Rt,
  repeated: !0
}, {
  no: 10,
  name: "simulcast_codecs",
  kind: "message",
  T: ss,
  repeated: !0
}, {
  no: 11,
  name: "sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 12,
  name: "stereo",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 13,
  name: "disable_red",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 14,
  name: "encryption",
  kind: "enum",
  T: v.getEnumType(H)
}, {
  no: 15,
  name: "stream",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 16,
  name: "backup_codec_policy",
  kind: "enum",
  T: v.getEnumType(yd)
}, {
  no: 17,
  name: "audio_features",
  kind: "enum",
  T: v.getEnumType(ge),
  repeated: !0
}, {
  no: 18,
  name: "packet_trailer_features",
  kind: "enum",
  T: v.getEnumType(kn),
  repeated: !0
}]), $s = /* @__PURE__ */ v.makeMessageType("livekit.PublishDataTrackRequest", () => [{
  no: 1,
  name: "pub_handle",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 2,
  name: "name",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "encryption",
  kind: "enum",
  T: v.getEnumType(H)
}, {
  no: 4,
  name: "frame_encoding",
  kind: "message",
  T: kd,
  opt: !0
}, {
  no: 5,
  name: "schema",
  kind: "message",
  T: qs,
  opt: !0
}]), Qs = /* @__PURE__ */ v.makeMessageType("livekit.PublishDataTrackResponse", () => [{
  no: 1,
  name: "info",
  kind: "message",
  T: $i
}]), Ys = /* @__PURE__ */ v.makeMessageType("livekit.UnpublishDataTrackRequest", () => [{
  no: 1,
  name: "pub_handle",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}]), Mh = /* @__PURE__ */ v.makeMessageType("livekit.UnpublishDataTrackResponse", () => [{
  no: 1,
  name: "info",
  kind: "message",
  T: $i
}]), Oh = /* @__PURE__ */ v.makeMessageType("livekit.DataTrackSubscriberHandles", () => [{
  no: 1,
  name: "sub_handles",
  kind: "map",
  K: 13,
  V: {
    kind: "message",
    T: Lh
  }
}]), Lh = /* @__PURE__ */ v.makeMessageType("livekit.DataTrackSubscriberHandles.PublishedDataTrack", () => [{
  no: 1,
  name: "publisher_identity",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "publisher_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "track_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}], {
  localName: "DataTrackSubscriberHandles_PublishedDataTrack"
}), Xi = /* @__PURE__ */ v.makeMessageType("livekit.TrickleRequest", () => [{
  no: 1,
  name: "candidateInit",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "target",
  kind: "enum",
  T: v.getEnumType(Oe)
}, {
  no: 3,
  name: "final",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}]), Zi = /* @__PURE__ */ v.makeMessageType("livekit.MuteTrackRequest", () => [{
  no: 1,
  name: "sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "muted",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}]), Dh = /* @__PURE__ */ v.makeMessageType("livekit.JoinResponse", () => [{
  no: 1,
  name: "room",
  kind: "message",
  T: Ji
}, {
  no: 2,
  name: "participant",
  kind: "message",
  T: Kt
}, {
  no: 3,
  name: "other_participants",
  kind: "message",
  T: Kt,
  repeated: !0
}, {
  no: 4,
  name: "server_version",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 5,
  name: "ice_servers",
  kind: "message",
  T: jd,
  repeated: !0
}, {
  no: 6,
  name: "subscriber_primary",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 7,
  name: "alternative_url",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 8,
  name: "client_configuration",
  kind: "message",
  T: Md
}, {
  no: 9,
  name: "server_region",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 10,
  name: "ping_timeout",
  kind: "scalar",
  T: 5
  /* ScalarType.INT32 */
}, {
  no: 11,
  name: "ping_interval",
  kind: "scalar",
  T: 5
  /* ScalarType.INT32 */
}, {
  no: 12,
  name: "server_info",
  kind: "message",
  T: Rd
}, {
  no: 13,
  name: "sif_trailer",
  kind: "scalar",
  T: 12
  /* ScalarType.BYTES */
}, {
  no: 14,
  name: "enabled_publish_codecs",
  kind: "message",
  T: Di,
  repeated: !0
}, {
  no: 15,
  name: "fast_publish",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}]), Nh = /* @__PURE__ */ v.makeMessageType("livekit.ReconnectResponse", () => [{
  no: 1,
  name: "ice_servers",
  kind: "message",
  T: jd,
  repeated: !0
}, {
  no: 2,
  name: "client_configuration",
  kind: "message",
  T: Md
}, {
  no: 3,
  name: "server_info",
  kind: "message",
  T: Rd
}, {
  no: 4,
  name: "last_message_seq",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}]), Xs = /* @__PURE__ */ v.makeMessageType("livekit.TrackPublishedResponse", () => [{
  no: 1,
  name: "cid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "track",
  kind: "message",
  T: rn
}]), Uh = /* @__PURE__ */ v.makeMessageType("livekit.TrackUnpublishedResponse", () => [{
  no: 1,
  name: "track_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}]), Ot = /* @__PURE__ */ v.makeMessageType("livekit.SessionDescription", () => [{
  no: 1,
  name: "type",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "sdp",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "id",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 4,
  name: "mid_to_track_id",
  kind: "map",
  K: 9,
  V: {
    kind: "scalar",
    T: 9
    /* ScalarType.STRING */
  }
}]), Fh = /* @__PURE__ */ v.makeMessageType("livekit.ParticipantUpdate", () => [{
  no: 1,
  name: "participants",
  kind: "message",
  T: Kt,
  repeated: !0
}]), er = /* @__PURE__ */ v.makeMessageType("livekit.UpdateSubscription", () => [{
  no: 1,
  name: "track_sids",
  kind: "scalar",
  T: 9,
  repeated: !0
}, {
  no: 2,
  name: "subscribe",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 3,
  name: "participant_tracks",
  kind: "message",
  T: Pd,
  repeated: !0
}]), Zs = /* @__PURE__ */ v.makeMessageType("livekit.UpdateDataSubscription", () => [{
  no: 1,
  name: "updates",
  kind: "message",
  T: Nd,
  repeated: !0
}]), Nd = /* @__PURE__ */ v.makeMessageType("livekit.UpdateDataSubscription.Update", () => [{
  no: 1,
  name: "track_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "subscribe",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 3,
  name: "options",
  kind: "message",
  T: wh
}], {
  localName: "UpdateDataSubscription_Update"
}), Bh = /* @__PURE__ */ v.makeMessageType("livekit.StoreDataBlobRequest", () => [{
  no: 1,
  name: "request_id",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 2,
  name: "blob",
  kind: "message",
  T: Td
}]), jh = /* @__PURE__ */ v.makeMessageType("livekit.StoreDataBlobResponse", () => [{
  no: 1,
  name: "request_id",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 2,
  name: "key",
  kind: "message",
  T: Vs
}]), qh = /* @__PURE__ */ v.makeMessageType("livekit.GetDataBlobRequest", () => [{
  no: 1,
  name: "request_id",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 2,
  name: "participant_identity",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "key",
  kind: "message",
  T: Vs
}]), Vh = /* @__PURE__ */ v.makeMessageType("livekit.GetDataBlobResponse", () => [{
  no: 1,
  name: "request_id",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 2,
  name: "blob",
  kind: "message",
  T: Td
}]), Ud = /* @__PURE__ */ v.makeMessageType("livekit.UpdateTrackSettings", () => [{
  no: 1,
  name: "track_sids",
  kind: "scalar",
  T: 9,
  repeated: !0
}, {
  no: 3,
  name: "disabled",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 4,
  name: "quality",
  kind: "enum",
  T: v.getEnumType(js)
}, {
  no: 5,
  name: "width",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 6,
  name: "height",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 7,
  name: "fps",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 8,
  name: "priority",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}]), ea = /* @__PURE__ */ v.makeMessageType("livekit.UpdateLocalAudioTrack", () => [{
  no: 1,
  name: "track_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "features",
  kind: "enum",
  T: v.getEnumType(ge),
  repeated: !0
}]), Fd = /* @__PURE__ */ v.makeMessageType("livekit.UpdateLocalVideoTrack", () => [{
  no: 1,
  name: "track_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "width",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 3,
  name: "height",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}]), tr = /* @__PURE__ */ v.makeMessageType("livekit.LeaveRequest", () => [{
  no: 1,
  name: "can_reconnect",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 2,
  name: "reason",
  kind: "enum",
  T: v.getEnumType(Le)
}, {
  no: 3,
  name: "action",
  kind: "enum",
  T: v.getEnumType(cn)
}, {
  no: 4,
  name: "regions",
  kind: "message",
  T: tf
}]), cn = /* @__PURE__ */ v.makeEnum("livekit.LeaveRequest.Action", [{
  no: 0,
  name: "DISCONNECT"
}, {
  no: 1,
  name: "RESUME"
}, {
  no: 2,
  name: "RECONNECT"
}]), Bd = /* @__PURE__ */ v.makeMessageType("livekit.UpdateVideoLayers", () => [{
  no: 1,
  name: "track_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "layers",
  kind: "message",
  T: Rt,
  repeated: !0
}]), ta = /* @__PURE__ */ v.makeMessageType("livekit.UpdateParticipantMetadata", () => [{
  no: 1,
  name: "metadata",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "name",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "attributes",
  kind: "map",
  K: 9,
  V: {
    kind: "scalar",
    T: 9
    /* ScalarType.STRING */
  }
}, {
  no: 4,
  name: "request_id",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}]), jd = /* @__PURE__ */ v.makeMessageType("livekit.ICEServer", () => [{
  no: 1,
  name: "urls",
  kind: "scalar",
  T: 9,
  repeated: !0
}, {
  no: 2,
  name: "username",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "credential",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}]), Wh = /* @__PURE__ */ v.makeMessageType("livekit.SpeakersChanged", () => [{
  no: 1,
  name: "speakers",
  kind: "message",
  T: wd,
  repeated: !0
}]), Hh = /* @__PURE__ */ v.makeMessageType("livekit.RoomUpdate", () => [{
  no: 1,
  name: "room",
  kind: "message",
  T: Ji
}]), zh = /* @__PURE__ */ v.makeMessageType("livekit.ConnectionQualityInfo", () => [{
  no: 1,
  name: "participant_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "quality",
  kind: "enum",
  T: v.getEnumType(nn)
}, {
  no: 3,
  name: "score",
  kind: "scalar",
  T: 2
  /* ScalarType.FLOAT */
}]), Kh = /* @__PURE__ */ v.makeMessageType("livekit.ConnectionQualityUpdate", () => [{
  no: 1,
  name: "updates",
  kind: "message",
  T: zh,
  repeated: !0
}]), Gh = /* @__PURE__ */ v.makeMessageType("livekit.StreamStateInfo", () => [{
  no: 1,
  name: "participant_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "track_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "state",
  kind: "enum",
  T: v.getEnumType(rs)
}]), Jh = /* @__PURE__ */ v.makeMessageType("livekit.StreamStateUpdate", () => [{
  no: 1,
  name: "stream_states",
  kind: "message",
  T: Gh,
  repeated: !0
}]), na = /* @__PURE__ */ v.makeMessageType("livekit.SubscribedQuality", () => [{
  no: 1,
  name: "quality",
  kind: "enum",
  T: v.getEnumType(js)
}, {
  no: 2,
  name: "enabled",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}]), $h = /* @__PURE__ */ v.makeMessageType("livekit.SubscribedCodec", () => [{
  no: 1,
  name: "codec",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "qualities",
  kind: "message",
  T: na,
  repeated: !0
}]), Qh = /* @__PURE__ */ v.makeMessageType("livekit.SubscribedQualityUpdate", () => [{
  no: 1,
  name: "track_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "subscribed_qualities",
  kind: "message",
  T: na,
  repeated: !0
}, {
  no: 3,
  name: "subscribed_codecs",
  kind: "message",
  T: $h,
  repeated: !0
}]), Yh = /* @__PURE__ */ v.makeMessageType("livekit.SubscribedAudioCodecUpdate", () => [{
  no: 1,
  name: "track_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "subscribed_audio_codecs",
  kind: "message",
  T: Ih,
  repeated: !0
}]), qd = /* @__PURE__ */ v.makeMessageType("livekit.TrackPermission", () => [{
  no: 1,
  name: "participant_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "all_tracks",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 3,
  name: "track_sids",
  kind: "scalar",
  T: 9,
  repeated: !0
}, {
  no: 4,
  name: "participant_identity",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}]), Vd = /* @__PURE__ */ v.makeMessageType("livekit.SubscriptionPermission", () => [{
  no: 1,
  name: "all_participants",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 2,
  name: "track_permissions",
  kind: "message",
  T: qd,
  repeated: !0
}]), Xh = /* @__PURE__ */ v.makeMessageType("livekit.SubscriptionPermissionUpdate", () => [{
  no: 1,
  name: "participant_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "track_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "allowed",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}]), Zh = /* @__PURE__ */ v.makeMessageType("livekit.RoomMovedResponse", () => [{
  no: 1,
  name: "room",
  kind: "message",
  T: Ji
}, {
  no: 2,
  name: "token",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "participant",
  kind: "message",
  T: Kt
}, {
  no: 4,
  name: "other_participants",
  kind: "message",
  T: Kt,
  repeated: !0
}]), ia = /* @__PURE__ */ v.makeMessageType("livekit.SyncState", () => [{
  no: 1,
  name: "answer",
  kind: "message",
  T: Ot
}, {
  no: 2,
  name: "subscription",
  kind: "message",
  T: er
}, {
  no: 3,
  name: "publish_tracks",
  kind: "message",
  T: Xs,
  repeated: !0
}, {
  no: 4,
  name: "data_channels",
  kind: "message",
  T: Hd,
  repeated: !0
}, {
  no: 5,
  name: "offer",
  kind: "message",
  T: Ot
}, {
  no: 6,
  name: "track_sids_disabled",
  kind: "scalar",
  T: 9,
  repeated: !0
}, {
  no: 7,
  name: "datachannel_receive_states",
  kind: "message",
  T: Wd,
  repeated: !0
}, {
  no: 8,
  name: "publish_data_tracks",
  kind: "message",
  T: Qs,
  repeated: !0
}, {
  no: 9,
  name: "data_subscription",
  kind: "message",
  T: Zs
}]), Wd = /* @__PURE__ */ v.makeMessageType("livekit.DataChannelReceiveState", () => [{
  no: 1,
  name: "publisher_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "last_seq",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}]), Hd = /* @__PURE__ */ v.makeMessageType("livekit.DataChannelInfo", () => [{
  no: 1,
  name: "label",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "id",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 3,
  name: "target",
  kind: "enum",
  T: v.getEnumType(Oe)
}]), Xe = /* @__PURE__ */ v.makeMessageType("livekit.SimulateScenario", () => [{
  no: 1,
  name: "speaker_update",
  kind: "scalar",
  T: 5,
  oneof: "scenario"
}, {
  no: 2,
  name: "node_failure",
  kind: "scalar",
  T: 8,
  oneof: "scenario"
}, {
  no: 3,
  name: "migration",
  kind: "scalar",
  T: 8,
  oneof: "scenario"
}, {
  no: 4,
  name: "server_leave",
  kind: "scalar",
  T: 8,
  oneof: "scenario"
}, {
  no: 5,
  name: "switch_candidate_protocol",
  kind: "enum",
  T: v.getEnumType(Ah),
  oneof: "scenario"
}, {
  no: 6,
  name: "subscriber_bandwidth",
  kind: "scalar",
  T: 3,
  oneof: "scenario"
}, {
  no: 7,
  name: "disconnect_signal_on_resume",
  kind: "scalar",
  T: 8,
  oneof: "scenario"
}, {
  no: 8,
  name: "disconnect_signal_on_resume_no_messages",
  kind: "scalar",
  T: 8,
  oneof: "scenario"
}, {
  no: 9,
  name: "leave_request_full_reconnect",
  kind: "scalar",
  T: 8,
  oneof: "scenario"
}]), zd = /* @__PURE__ */ v.makeMessageType("livekit.Ping", () => [{
  no: 1,
  name: "timestamp",
  kind: "scalar",
  T: 3
  /* ScalarType.INT64 */
}, {
  no: 2,
  name: "rtt",
  kind: "scalar",
  T: 3
  /* ScalarType.INT64 */
}]), ef = /* @__PURE__ */ v.makeMessageType("livekit.Pong", () => [{
  no: 1,
  name: "last_ping_timestamp",
  kind: "scalar",
  T: 3
  /* ScalarType.INT64 */
}, {
  no: 2,
  name: "timestamp",
  kind: "scalar",
  T: 3
  /* ScalarType.INT64 */
}]), tf = /* @__PURE__ */ v.makeMessageType("livekit.RegionSettings", () => [{
  no: 1,
  name: "regions",
  kind: "message",
  T: nf,
  repeated: !0
}]), nf = /* @__PURE__ */ v.makeMessageType("livekit.RegionInfo", () => [{
  no: 1,
  name: "region",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "url",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 3,
  name: "distance",
  kind: "scalar",
  T: 3
  /* ScalarType.INT64 */
}]), rf = /* @__PURE__ */ v.makeMessageType("livekit.SubscriptionResponse", () => [{
  no: 1,
  name: "track_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 2,
  name: "err",
  kind: "enum",
  T: v.getEnumType(vh)
}]), sf = /* @__PURE__ */ v.makeMessageType("livekit.RequestResponse", () => [{
  no: 1,
  name: "request_id",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 2,
  name: "reason",
  kind: "enum",
  T: v.getEnumType(Wt)
}, {
  no: 3,
  name: "message",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 4,
  name: "trickle",
  kind: "message",
  T: Xi,
  oneof: "request"
}, {
  no: 5,
  name: "add_track",
  kind: "message",
  T: si,
  oneof: "request"
}, {
  no: 6,
  name: "mute",
  kind: "message",
  T: Zi,
  oneof: "request"
}, {
  no: 7,
  name: "update_metadata",
  kind: "message",
  T: ta,
  oneof: "request"
}, {
  no: 8,
  name: "update_audio_track",
  kind: "message",
  T: ea,
  oneof: "request"
}, {
  no: 9,
  name: "update_video_track",
  kind: "message",
  T: Fd,
  oneof: "request"
}, {
  no: 10,
  name: "publish_data_track",
  kind: "message",
  T: $s,
  oneof: "request"
}, {
  no: 11,
  name: "unpublish_data_track",
  kind: "message",
  T: Ys,
  oneof: "request"
}]), Wt = /* @__PURE__ */ v.makeEnum("livekit.RequestResponse.Reason", [{
  no: 0,
  name: "OK"
}, {
  no: 1,
  name: "NOT_FOUND"
}, {
  no: 2,
  name: "NOT_ALLOWED"
}, {
  no: 3,
  name: "LIMIT_EXCEEDED"
}, {
  no: 4,
  name: "QUEUED"
}, {
  no: 5,
  name: "UNSUPPORTED_TYPE"
}, {
  no: 6,
  name: "UNCLASSIFIED_ERROR"
}, {
  no: 7,
  name: "INVALID_HANDLE"
}, {
  no: 8,
  name: "INVALID_NAME"
}, {
  no: 9,
  name: "DUPLICATE_HANDLE"
}, {
  no: 10,
  name: "DUPLICATE_NAME"
}, {
  no: 11,
  name: "INVALID_REQUEST"
}]), af = /* @__PURE__ */ v.makeMessageType("livekit.TrackSubscribed", () => [{
  no: 1,
  name: "track_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}]), Kd = /* @__PURE__ */ v.makeMessageType("livekit.ConnectionSettings", () => [{
  no: 1,
  name: "auto_subscribe",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 2,
  name: "adaptive_stream",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 3,
  name: "subscriber_allow_pause",
  kind: "scalar",
  T: 8,
  opt: !0
}, {
  no: 4,
  name: "disable_ice_lite",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 5,
  name: "auto_subscribe_data_track",
  kind: "scalar",
  T: 8,
  opt: !0
}]), of = /* @__PURE__ */ v.makeMessageType("livekit.JoinRequest", () => [{
  no: 1,
  name: "client_info",
  kind: "message",
  T: Ad
}, {
  no: 2,
  name: "connection_settings",
  kind: "message",
  T: Kd
}, {
  no: 3,
  name: "metadata",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 4,
  name: "participant_attributes",
  kind: "map",
  K: 9,
  V: {
    kind: "scalar",
    T: 9
    /* ScalarType.STRING */
  }
}, {
  no: 5,
  name: "add_track_requests",
  kind: "message",
  T: si,
  repeated: !0
}, {
  no: 6,
  name: "publisher_offer",
  kind: "message",
  T: Ot
}, {
  no: 7,
  name: "reconnect",
  kind: "scalar",
  T: 8
  /* ScalarType.BOOL */
}, {
  no: 8,
  name: "reconnect_reason",
  kind: "enum",
  T: v.getEnumType(lt)
}, {
  no: 9,
  name: "participant_sid",
  kind: "scalar",
  T: 9
  /* ScalarType.STRING */
}, {
  no: 10,
  name: "sync_state",
  kind: "message",
  T: ia
}]), cf = /* @__PURE__ */ v.makeMessageType("livekit.WrappedJoinRequest", () => [{
  no: 1,
  name: "compression",
  kind: "enum",
  T: v.getEnumType(as)
}, {
  no: 2,
  name: "join_request",
  kind: "scalar",
  T: 12
  /* ScalarType.BYTES */
}]), as = /* @__PURE__ */ v.makeEnum("livekit.WrappedJoinRequest.Compression", [{
  no: 0,
  name: "NONE"
}, {
  no: 1,
  name: "GZIP"
}]), df = /* @__PURE__ */ v.makeMessageType("livekit.MediaSectionsRequirement", () => [{
  no: 1,
  name: "num_audios",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}, {
  no: 2,
  name: "num_videos",
  kind: "scalar",
  T: 13
  /* ScalarType.UINT32 */
}]);
var Ii = { exports: {} }, lf = Ii.exports, ro;
function uf() {
  return ro || (ro = 1, (function(i) {
    (function(e, t) {
      i.exports ? i.exports = t() : e.log = t();
    })(lf, function() {
      var e = function() {
      }, t = "undefined", n = typeof window !== t && typeof window.navigator !== t && /Trident\/|MSIE /.test(window.navigator.userAgent), r = ["trace", "debug", "info", "warn", "error"], s = {}, o = null;
      function a(p, y) {
        var k = p[y];
        if (typeof k.bind == "function")
          return k.bind(p);
        try {
          return Function.prototype.bind.call(k, p);
        } catch {
          return function() {
            return Function.prototype.apply.apply(k, [p, arguments]);
          };
        }
      }
      function c() {
        console.log && (console.log.apply ? console.log.apply(console, arguments) : Function.prototype.apply.apply(console.log, [console, arguments])), console.trace && console.trace();
      }
      function d(p) {
        return p === "debug" && (p = "log"), typeof console === t ? !1 : p === "trace" && n ? c : console[p] !== void 0 ? a(console, p) : console.log !== void 0 ? a(console, "log") : e;
      }
      function l() {
        for (var p = this.getLevel(), y = 0; y < r.length; y++) {
          var k = r[y];
          this[k] = y < p ? e : this.methodFactory(k, p, this.name);
        }
        if (this.log = this.debug, typeof console === t && p < this.levels.SILENT)
          return "No console available for logging";
      }
      function u(p) {
        return function() {
          typeof console !== t && (l.call(this), this[p].apply(this, arguments));
        };
      }
      function h(p, y, k) {
        return d(p) || u.apply(this, arguments);
      }
      function f(p, y) {
        var k = this, w, A, b, T = "loglevel";
        typeof p == "string" ? T += ":" + p : typeof p == "symbol" && (T = void 0);
        function S(F) {
          var K = (r[F] || "silent").toUpperCase();
          if (!(typeof window === t || !T)) {
            try {
              window.localStorage[T] = K;
              return;
            } catch {
            }
            try {
              window.document.cookie = encodeURIComponent(T) + "=" + K + ";";
            } catch {
            }
          }
        }
        function I() {
          var F;
          if (!(typeof window === t || !T)) {
            try {
              F = window.localStorage[T];
            } catch {
            }
            if (typeof F === t)
              try {
                var K = window.document.cookie, Y = encodeURIComponent(T), Me = K.indexOf(Y + "=");
                Me !== -1 && (F = /^([^;]+)/.exec(K.slice(Me + Y.length + 1))[1]);
              } catch {
              }
            return k.levels[F] === void 0 && (F = void 0), F;
          }
        }
        function O() {
          if (!(typeof window === t || !T)) {
            try {
              window.localStorage.removeItem(T);
            } catch {
            }
            try {
              window.document.cookie = encodeURIComponent(T) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
            } catch {
            }
          }
        }
        function U(F) {
          var K = F;
          if (typeof K == "string" && k.levels[K.toUpperCase()] !== void 0 && (K = k.levels[K.toUpperCase()]), typeof K == "number" && K >= 0 && K <= k.levels.SILENT)
            return K;
          throw new TypeError("log.setLevel() called with invalid level: " + F);
        }
        k.name = p, k.levels = {
          TRACE: 0,
          DEBUG: 1,
          INFO: 2,
          WARN: 3,
          ERROR: 4,
          SILENT: 5
        }, k.methodFactory = y || h, k.getLevel = function() {
          return b ?? A ?? w;
        }, k.setLevel = function(F, K) {
          return b = U(F), K !== !1 && S(b), l.call(k);
        }, k.setDefaultLevel = function(F) {
          A = U(F), I() || k.setLevel(F, !1);
        }, k.resetLevel = function() {
          b = null, O(), l.call(k);
        }, k.enableAll = function(F) {
          k.setLevel(k.levels.TRACE, F);
        }, k.disableAll = function(F) {
          k.setLevel(k.levels.SILENT, F);
        }, k.rebuild = function() {
          if (o !== k && (w = U(o.getLevel())), l.call(k), o === k)
            for (var F in s)
              s[F].rebuild();
        }, w = U(o ? o.getLevel() : "WARN");
        var N = I();
        N != null && (b = U(N)), l.call(k);
      }
      o = new f(), o.getLogger = function(y) {
        if (typeof y != "symbol" && typeof y != "string" || y === "")
          throw new TypeError("You must supply a name when creating a logger.");
        var k = s[y];
        return k || (k = s[y] = new f(y, o.methodFactory)), k;
      };
      var g = typeof window !== t ? window.log : void 0;
      return o.noConflict = function() {
        return typeof window !== t && window.log === o && (window.log = g), o;
      }, o.getLoggers = function() {
        return s;
      }, o.default = o, o;
    });
  })(Ii)), Ii.exports;
}
var hf = uf(), nr = /* @__PURE__ */ $c(hf), os;
(function(i) {
  i[i.trace = 0] = "trace", i[i.debug = 1] = "debug", i[i.info = 2] = "info", i[i.warn = 3] = "warn", i[i.error = 4] = "error", i[i.silent = 5] = "silent";
})(os || (os = {}));
var ne;
(function(i) {
  i.Default = "livekit", i.Room = "livekit-room", i.TokenSource = "livekit-token-source", i.Participant = "livekit-participant", i.Track = "livekit-track", i.Publication = "livekit-track-publication", i.Engine = "livekit-engine", i.Signal = "livekit-signal", i.PCManager = "livekit-pc-manager", i.PCTransport = "livekit-pc-transport", i.E2EE = "lk-e2ee", i.DataTracks = "livekit-data-tracks", i.Region = "livekit-region", i.ICE = "livekit-ice", i.Stats = "livekit-stats";
})(ne || (ne = {}));
let q = nr.getLogger(ne.Default);
Object.values(ne).map((i) => nr.getLogger(i));
q.setDefaultLevel(os.info);
function pe(i, e) {
  const t = nr.getLogger(i);
  return t.setDefaultLevel(q.getLevel()), e ? ff(t, e) : t;
}
function ff(i, e) {
  const t = (r) => (s, o) => {
    const a = e(), c = a || o ? Object.assign(Object.assign({}, a), o) : void 0;
    i[r](s, c);
  }, n = Object.create(i);
  return n.trace = t("trace"), n.debug = t("debug"), n.info = t("info"), n.warn = t("warn"), n.error = t("error"), n;
}
const Tn = nr.getLogger(ne.E2EE), cs = /* @__PURE__ */ new Set(), pf = Tn.setLevel.bind(Tn);
Tn.setLevel = (i, e) => {
  pf(i, e);
  const t = Tn.getLevel();
  cs.forEach((n) => n(t));
};
function so(i) {
  return cs.add(i), () => {
    cs.delete(i);
  };
}
function mf(i, e) {
  var t = {};
  for (var n in i) Object.prototype.hasOwnProperty.call(i, n) && e.indexOf(n) < 0 && (t[n] = i[n]);
  if (i != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, n = Object.getOwnPropertySymbols(i); r < n.length; r++)
      e.indexOf(n[r]) < 0 && Object.prototype.propertyIsEnumerable.call(i, n[r]) && (t[n[r]] = i[n[r]]);
  return t;
}
function m(i, e, t, n) {
  function r(s) {
    return s instanceof t ? s : new t(function(o) {
      o(s);
    });
  }
  return new (t || (t = Promise))(function(s, o) {
    function a(l) {
      try {
        d(n.next(l));
      } catch (u) {
        o(u);
      }
    }
    function c(l) {
      try {
        d(n.throw(l));
      } catch (u) {
        o(u);
      }
    }
    function d(l) {
      l.done ? s(l.value) : r(l.value).then(a, c);
    }
    d((n = n.apply(i, e || [])).next());
  });
}
function ao(i) {
  var e = typeof Symbol == "function" && Symbol.iterator, t = e && i[e], n = 0;
  if (t) return t.call(i);
  if (i && typeof i.length == "number") return {
    next: function() {
      return i && n >= i.length && (i = void 0), { value: i && i[n++], done: !i };
    }
  };
  throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function bt(i) {
  return this instanceof bt ? (this.v = i, this) : new bt(i);
}
function Gd(i, e, t) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var n = t.apply(i, e || []), r, s = [];
  return r = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), a("next"), a("throw"), a("return", o), r[Symbol.asyncIterator] = function() {
    return this;
  }, r;
  function o(f) {
    return function(g) {
      return Promise.resolve(g).then(f, u);
    };
  }
  function a(f, g) {
    n[f] && (r[f] = function(p) {
      return new Promise(function(y, k) {
        s.push([f, p, y, k]) > 1 || c(f, p);
      });
    }, g && (r[f] = g(r[f])));
  }
  function c(f, g) {
    try {
      d(n[f](g));
    } catch (p) {
      h(s[0][3], p);
    }
  }
  function d(f) {
    f.value instanceof bt ? Promise.resolve(f.value.v).then(l, u) : h(s[0][2], f);
  }
  function l(f) {
    c("next", f);
  }
  function u(f) {
    c("throw", f);
  }
  function h(f, g) {
    f(g), s.shift(), s.length && c(s[0][0], s[0][1]);
  }
}
function gf(i) {
  var e, t;
  return e = {}, n("next"), n("throw", function(r) {
    throw r;
  }), n("return"), e[Symbol.iterator] = function() {
    return this;
  }, e;
  function n(r, s) {
    e[r] = i[r] ? function(o) {
      return (t = !t) ? { value: bt(i[r](o)), done: !1 } : s ? s(o) : o;
    } : s;
  }
}
function je(i) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var e = i[Symbol.asyncIterator], t;
  return e ? e.call(i) : (i = typeof ao == "function" ? ao(i) : i[Symbol.iterator](), t = {}, n("next"), n("throw"), n("return"), t[Symbol.asyncIterator] = function() {
    return this;
  }, t);
  function n(s) {
    t[s] = i[s] && function(o) {
      return new Promise(function(a, c) {
        o = i[s](o), r(a, c, o.done, o.value);
      });
    };
  }
  function r(s, o, a, c) {
    Promise.resolve(c).then(function(d) {
      s({ value: d, done: a });
    }, o);
  }
}
var li = { exports: {} }, oo;
function vf() {
  if (oo) return li.exports;
  oo = 1;
  var i = typeof Reflect == "object" ? Reflect : null, e = i && typeof i.apply == "function" ? i.apply : function(T, S, I) {
    return Function.prototype.apply.call(T, S, I);
  }, t;
  i && typeof i.ownKeys == "function" ? t = i.ownKeys : Object.getOwnPropertySymbols ? t = function(T) {
    return Object.getOwnPropertyNames(T).concat(Object.getOwnPropertySymbols(T));
  } : t = function(T) {
    return Object.getOwnPropertyNames(T);
  };
  function n(b) {
    console && console.warn && console.warn(b);
  }
  var r = Number.isNaN || function(T) {
    return T !== T;
  };
  function s() {
    s.init.call(this);
  }
  li.exports = s, li.exports.once = k, s.EventEmitter = s, s.prototype._events = void 0, s.prototype._eventsCount = 0, s.prototype._maxListeners = void 0;
  var o = 10;
  function a(b) {
    if (typeof b != "function")
      throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof b);
  }
  Object.defineProperty(s, "defaultMaxListeners", {
    enumerable: !0,
    get: function() {
      return o;
    },
    set: function(b) {
      if (typeof b != "number" || b < 0 || r(b))
        throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + b + ".");
      o = b;
    }
  }), s.init = function() {
    (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
  }, s.prototype.setMaxListeners = function(T) {
    if (typeof T != "number" || T < 0 || r(T))
      throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + T + ".");
    return this._maxListeners = T, this;
  };
  function c(b) {
    return b._maxListeners === void 0 ? s.defaultMaxListeners : b._maxListeners;
  }
  s.prototype.getMaxListeners = function() {
    return c(this);
  }, s.prototype.emit = function(T) {
    for (var S = [], I = 1; I < arguments.length; I++) S.push(arguments[I]);
    var O = T === "error", U = this._events;
    if (U !== void 0) O = O && U.error === void 0;
    else if (!O) return !1;
    if (O) {
      var N;
      if (S.length > 0 && (N = S[0]), N instanceof Error)
        throw N;
      var F = new Error("Unhandled error." + (N ? " (" + N.message + ")" : ""));
      throw F.context = N, F;
    }
    var K = U[T];
    if (K === void 0) return !1;
    if (typeof K == "function")
      e(K, this, S);
    else
      for (var Y = K.length, Me = g(K, Y), I = 0; I < Y; ++I) e(Me[I], this, S);
    return !0;
  };
  function d(b, T, S, I) {
    var O, U, N;
    if (a(S), U = b._events, U === void 0 ? (U = b._events = /* @__PURE__ */ Object.create(null), b._eventsCount = 0) : (U.newListener !== void 0 && (b.emit("newListener", T, S.listener ? S.listener : S), U = b._events), N = U[T]), N === void 0)
      N = U[T] = S, ++b._eventsCount;
    else if (typeof N == "function" ? N = U[T] = I ? [S, N] : [N, S] : I ? N.unshift(S) : N.push(S), O = c(b), O > 0 && N.length > O && !N.warned) {
      N.warned = !0;
      var F = new Error("Possible EventEmitter memory leak detected. " + N.length + " " + String(T) + " listeners added. Use emitter.setMaxListeners() to increase limit");
      F.name = "MaxListenersExceededWarning", F.emitter = b, F.type = T, F.count = N.length, n(F);
    }
    return b;
  }
  s.prototype.addListener = function(T, S) {
    return d(this, T, S, !1);
  }, s.prototype.on = s.prototype.addListener, s.prototype.prependListener = function(T, S) {
    return d(this, T, S, !0);
  };
  function l() {
    if (!this.fired)
      return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
  }
  function u(b, T, S) {
    var I = {
      fired: !1,
      wrapFn: void 0,
      target: b,
      type: T,
      listener: S
    }, O = l.bind(I);
    return O.listener = S, I.wrapFn = O, O;
  }
  s.prototype.once = function(T, S) {
    return a(S), this.on(T, u(this, T, S)), this;
  }, s.prototype.prependOnceListener = function(T, S) {
    return a(S), this.prependListener(T, u(this, T, S)), this;
  }, s.prototype.removeListener = function(T, S) {
    var I, O, U, N, F;
    if (a(S), O = this._events, O === void 0) return this;
    if (I = O[T], I === void 0) return this;
    if (I === S || I.listener === S)
      --this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : (delete O[T], O.removeListener && this.emit("removeListener", T, I.listener || S));
    else if (typeof I != "function") {
      for (U = -1, N = I.length - 1; N >= 0; N--)
        if (I[N] === S || I[N].listener === S) {
          F = I[N].listener, U = N;
          break;
        }
      if (U < 0) return this;
      U === 0 ? I.shift() : p(I, U), I.length === 1 && (O[T] = I[0]), O.removeListener !== void 0 && this.emit("removeListener", T, F || S);
    }
    return this;
  }, s.prototype.off = s.prototype.removeListener, s.prototype.removeAllListeners = function(T) {
    var S, I, O;
    if (I = this._events, I === void 0) return this;
    if (I.removeListener === void 0)
      return arguments.length === 0 ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : I[T] !== void 0 && (--this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : delete I[T]), this;
    if (arguments.length === 0) {
      var U = Object.keys(I), N;
      for (O = 0; O < U.length; ++O)
        N = U[O], N !== "removeListener" && this.removeAllListeners(N);
      return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
    }
    if (S = I[T], typeof S == "function")
      this.removeListener(T, S);
    else if (S !== void 0)
      for (O = S.length - 1; O >= 0; O--)
        this.removeListener(T, S[O]);
    return this;
  };
  function h(b, T, S) {
    var I = b._events;
    if (I === void 0) return [];
    var O = I[T];
    return O === void 0 ? [] : typeof O == "function" ? S ? [O.listener || O] : [O] : S ? y(O) : g(O, O.length);
  }
  s.prototype.listeners = function(T) {
    return h(this, T, !0);
  }, s.prototype.rawListeners = function(T) {
    return h(this, T, !1);
  }, s.listenerCount = function(b, T) {
    return typeof b.listenerCount == "function" ? b.listenerCount(T) : f.call(b, T);
  }, s.prototype.listenerCount = f;
  function f(b) {
    var T = this._events;
    if (T !== void 0) {
      var S = T[b];
      if (typeof S == "function")
        return 1;
      if (S !== void 0)
        return S.length;
    }
    return 0;
  }
  s.prototype.eventNames = function() {
    return this._eventsCount > 0 ? t(this._events) : [];
  };
  function g(b, T) {
    for (var S = new Array(T), I = 0; I < T; ++I) S[I] = b[I];
    return S;
  }
  function p(b, T) {
    for (; T + 1 < b.length; T++) b[T] = b[T + 1];
    b.pop();
  }
  function y(b) {
    for (var T = new Array(b.length), S = 0; S < T.length; ++S)
      T[S] = b[S].listener || b[S];
    return T;
  }
  function k(b, T) {
    return new Promise(function(S, I) {
      function O(N) {
        b.removeListener(T, U), I(N);
      }
      function U() {
        typeof b.removeListener == "function" && b.removeListener("error", O), S([].slice.call(arguments));
      }
      A(b, T, U, {
        once: !0
      }), T !== "error" && w(b, O, {
        once: !0
      });
    });
  }
  function w(b, T, S) {
    typeof b.on == "function" && A(b, "error", T, S);
  }
  function A(b, T, S, I) {
    if (typeof b.on == "function")
      I.once ? b.once(T, S) : b.on(T, S);
    else if (typeof b.addEventListener == "function")
      b.addEventListener(T, function O(U) {
        I.once && b.removeEventListener(T, O), S(U);
      });
    else
      throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof b);
  }
  return li.exports;
}
var xe = vf(), ds, Jd;
class Ee extends (Jd = Promise) {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(e) {
    super(e);
  }
  catch(e) {
    return super.catch(e);
  }
  static reject(e) {
    return super.reject(e);
  }
  static all(e) {
    return super.all(e);
  }
  static race(e) {
    return super.race(e);
  }
}
ds = Ee;
Ee.resolve = (i) => Reflect.get(Jd, "resolve", ds).call(ds, i);
const bf = /version\/(\d+(\.?_?\d+)+)/i;
let br;
function ke(i) {
  let e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  if (typeof navigator > "u")
    return;
  const t = navigator.userAgent.toLowerCase();
  if (br === void 0 || e) {
    const n = yf.find((r) => r.test.test(t));
    br = n?.describe(t);
  }
  return br;
}
const yf = [
  {
    test: /firefox|iceweasel|fxios/i,
    describe(i) {
      return {
        name: "Firefox",
        version: Ai(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i, i),
        os: i.toLowerCase().includes("fxios") ? "iOS" : void 0,
        osVersion: yr(i)
      };
    }
  },
  {
    test: /chrom|crios|crmo/i,
    describe(i) {
      return {
        name: "Chrome",
        version: Ai(/(?:chrome|chromium|crios|crmo)\/(\d+(\.?_?\d+)+)/i, i),
        os: i.toLowerCase().includes("crios") ? "iOS" : void 0,
        osVersion: yr(i)
      };
    }
  },
  /* Safari */
  {
    test: /safari|applewebkit/i,
    describe(i) {
      return {
        name: "Safari",
        version: Ai(bf, i),
        os: i.includes("mobile/") ? "iOS" : "macOS",
        osVersion: yr(i)
      };
    }
  }
];
function Ai(i, e) {
  let t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
  const n = e.match(i);
  return n && n.length >= t && n[t] || "";
}
function yr(i) {
  return i.includes("mac os") ? Ai(/\(.+?(\d+_\d+(:?_\d+)?)/, i, 1).replace(/_/g, ".") : void 0;
}
var kf = "2.24.0";
const Tf = kf, $d = 18, Sf = $d, ra = 0, ls = 1, Qd = 2, Cf = Qd;
class ot extends Error {
  constructor(e, t, n) {
    super(t || "an error has occurred"), this.name = "LiveKitError", this.code = e, typeof n?.cause < "u" && (this.cause = n?.cause);
  }
}
class Ve extends ot {
}
var J;
(function(i) {
  i[i.NotAllowed = 0] = "NotAllowed", i[i.ServerUnreachable = 1] = "ServerUnreachable", i[i.InternalError = 2] = "InternalError", i[i.Cancelled = 3] = "Cancelled", i[i.LeaveRequest = 4] = "LeaveRequest", i[i.Timeout = 5] = "Timeout", i[i.WebSocket = 6] = "WebSocket", i[i.ServiceNotFound = 7] = "ServiceNotFound";
})(J || (J = {}));
class M extends Ve {
  constructor(e, t, n, r) {
    super(1, e), this.name = "ConnectionError", this.status = n, this.reason = t, this.context = r, this.reasonName = J[t];
  }
  static notAllowed(e, t, n) {
    return new M(e, J.NotAllowed, t, n);
  }
  static timeout(e) {
    return new M(e, J.Timeout);
  }
  static leaveRequest(e, t) {
    return new M(e, J.LeaveRequest, void 0, t);
  }
  static internal(e, t) {
    return new M(e, J.InternalError, void 0, t);
  }
  static cancelled(e) {
    return new M(e, J.Cancelled);
  }
  static serverUnreachable(e, t) {
    return new M(e, J.ServerUnreachable, t);
  }
  static websocket(e, t, n) {
    return new M(e, J.WebSocket, t, n);
  }
  static serviceNotFound(e, t) {
    return new M(e, J.ServiceNotFound, void 0, t);
  }
}
function wf(i) {
  return i.reason === J.Cancelled ? !1 : i.reason === J.NotAllowed ? i.status === 403 : !0;
}
class sa extends ot {
  constructor(e) {
    super(21, e ?? "device is unsupported"), this.name = "DeviceUnsupportedError";
  }
}
class st extends ot {
  constructor(e) {
    super(20, e ?? "track is invalid"), this.name = "TrackInvalidError";
  }
}
class Ef extends ot {
  constructor(e) {
    super(10, e || "unsupported server"), this.name = "UnsupportedServer";
  }
}
class $ extends ot {
  constructor(e) {
    super(12, e || "unexpected connection state"), this.name = "UnexpectedConnectionState";
  }
}
class At extends ot {
  constructor(e) {
    super(13, e || "unable to negotiate"), this.name = "NegotiationError";
  }
}
class _f extends ot {
  constructor(e) {
    super(14, e || "unable to publish data"), this.name = "PublishDataError";
  }
}
class co extends ot {
  constructor(e, t) {
    super(15, e), this.name = "PublishTrackError", this.status = t;
  }
}
class lo extends Ve {
  constructor(e, t) {
    super(15, e), this.name = "SignalRequestError", this.reason = t, this.reasonName = typeof t == "string" ? t : Wt[t];
  }
}
var ee;
(function(i) {
  i[i.AlreadyOpened = 0] = "AlreadyOpened", i[i.AbnormalEnd = 1] = "AbnormalEnd", i[i.DecodeFailed = 2] = "DecodeFailed", i[i.LengthExceeded = 3] = "LengthExceeded", i[i.Incomplete = 4] = "Incomplete", i[i.HandlerAlreadyRegistered = 7] = "HandlerAlreadyRegistered", i[i.EncryptionTypeMismatch = 8] = "EncryptionTypeMismatch", i[i.HeaderTooLarge = 9] = "HeaderTooLarge", i[i.PayloadTooLarge = 10] = "PayloadTooLarge";
})(ee || (ee = {}));
class ce extends Ve {
  constructor(e, t) {
    super(16, e), this.name = "DataStreamError", this.reason = t, this.reasonName = ee[t];
  }
}
class en extends ot {
  constructor(e) {
    super(18, e), this.name = "SignalReconnectError";
  }
}
var Ni;
(function(i) {
  i.PermissionDenied = "PermissionDenied", i.NotFound = "NotFound", i.DeviceInUse = "DeviceInUse", i.Other = "Other";
})(Ni || (Ni = {}));
(function(i) {
  function e(t) {
    if (t && "name" in t)
      return t.name === "NotFoundError" || t.name === "DevicesNotFoundError" ? i.NotFound : t.name === "NotAllowedError" || t.name === "PermissionDeniedError" ? i.PermissionDenied : t.name === "NotReadableError" || t.name === "TrackStartError" ? i.DeviceInUse : i.Other;
  }
  i.getFailure = e;
})(Ni || (Ni = {}));
class z {
}
z.setTimeout = function() {
  return setTimeout(...arguments);
};
z.setInterval = // eslint-disable-next-line @typescript-eslint/no-implied-eval
function() {
  return setInterval(...arguments);
};
z.clearTimeout = function() {
  return clearTimeout(...arguments);
};
z.clearInterval = function() {
  return clearInterval(...arguments);
};
var _;
(function(i) {
  i.Connected = "connected", i.Reconnecting = "reconnecting", i.SignalReconnecting = "signalReconnecting", i.Reconnected = "reconnected", i.Disconnected = "disconnected", i.ConnectionStateChanged = "connectionStateChanged", i.Moved = "moved", i.MediaDevicesChanged = "mediaDevicesChanged", i.ParticipantConnected = "participantConnected", i.ParticipantDisconnected = "participantDisconnected", i.TrackPublished = "trackPublished", i.TrackSubscribed = "trackSubscribed", i.TrackSubscriptionFailed = "trackSubscriptionFailed", i.TrackUnpublished = "trackUnpublished", i.TrackUnsubscribed = "trackUnsubscribed", i.TrackMuted = "trackMuted", i.TrackUnmuted = "trackUnmuted", i.LocalTrackPublished = "localTrackPublished", i.LocalTrackUnpublished = "localTrackUnpublished", i.LocalAudioSilenceDetected = "localAudioSilenceDetected", i.ActiveSpeakersChanged = "activeSpeakersChanged", i.ParticipantMetadataChanged = "participantMetadataChanged", i.ParticipantNameChanged = "participantNameChanged", i.ParticipantAttributesChanged = "participantAttributesChanged", i.ParticipantActive = "participantActive", i.RoomMetadataChanged = "roomMetadataChanged", i.DataReceived = "dataReceived", i.SipDTMFReceived = "sipDTMFReceived", i.TranscriptionReceived = "transcriptionReceived", i.ConnectionQualityChanged = "connectionQualityChanged", i.TrackStreamStateChanged = "trackStreamStateChanged", i.TrackSubscriptionPermissionChanged = "trackSubscriptionPermissionChanged", i.TrackSubscriptionStatusChanged = "trackSubscriptionStatusChanged", i.AudioPlaybackStatusChanged = "audioPlaybackChanged", i.VideoPlaybackStatusChanged = "videoPlaybackChanged", i.MediaDevicesError = "mediaDevicesError", i.ParticipantPermissionsChanged = "participantPermissionsChanged", i.SignalConnected = "signalConnected", i.RecordingStatusChanged = "recordingStatusChanged", i.ParticipantEncryptionStatusChanged = "participantEncryptionStatusChanged", i.EncryptionError = "encryptionError", i.DCBufferStatusChanged = "dcBufferStatusChanged", i.ActiveDeviceChanged = "activeDeviceChanged", i.ChatMessage = "chatMessage", i.LocalTrackSubscribed = "localTrackSubscribed", i.MetricsReceived = "metricsReceived", i.DataTrackPublished = "dataTrackPublished", i.DataTrackUnpublished = "dataTrackUnpublished", i.LocalDataTrackPublished = "localDataTrackPublished", i.LocalDataTrackUnpublished = "localDataTrackUnpublished";
})(_ || (_ = {}));
var x;
(function(i) {
  i.TrackPublished = "trackPublished", i.TrackSubscribed = "trackSubscribed", i.TrackSubscriptionFailed = "trackSubscriptionFailed", i.TrackUnpublished = "trackUnpublished", i.TrackUnsubscribed = "trackUnsubscribed", i.TrackMuted = "trackMuted", i.TrackUnmuted = "trackUnmuted", i.LocalTrackPublished = "localTrackPublished", i.LocalTrackUnpublished = "localTrackUnpublished", i.LocalTrackCpuConstrained = "localTrackCpuConstrained", i.LocalSenderCreated = "localSenderCreated", i.ParticipantMetadataChanged = "participantMetadataChanged", i.ParticipantNameChanged = "participantNameChanged", i.DataReceived = "dataReceived", i.SipDTMFReceived = "sipDTMFReceived", i.TranscriptionReceived = "transcriptionReceived", i.IsSpeakingChanged = "isSpeakingChanged", i.ConnectionQualityChanged = "connectionQualityChanged", i.TrackStreamStateChanged = "trackStreamStateChanged", i.TrackSubscriptionPermissionChanged = "trackSubscriptionPermissionChanged", i.TrackSubscriptionStatusChanged = "trackSubscriptionStatusChanged", i.TrackCpuConstrained = "trackCpuConstrained", i.MediaDevicesError = "mediaDevicesError", i.AudioStreamAcquired = "audioStreamAcquired", i.ParticipantPermissionsChanged = "participantPermissionsChanged", i.PCTrackAdded = "pcTrackAdded", i.AttributesChanged = "attributesChanged", i.LocalTrackSubscribed = "localTrackSubscribed", i.ChatMessage = "chatMessage", i.Active = "active";
})(x || (x = {}));
var P;
(function(i) {
  i.TransportsCreated = "transportsCreated", i.Connected = "connected", i.Disconnected = "disconnected", i.Resuming = "resuming", i.Resumed = "resumed", i.Restarting = "restarting", i.Restarted = "restarted", i.SignalResumed = "signalResumed", i.SignalRestarted = "signalRestarted", i.Closing = "closing", i.MediaTrackAdded = "mediaTrackAdded", i.ActiveSpeakersUpdate = "activeSpeakersUpdate", i.DataPacketReceived = "dataPacketReceived", i.RTPVideoMapUpdate = "rtpVideoMapUpdate", i.DCBufferStatusChanged = "dcBufferStatusChanged", i.ParticipantUpdate = "participantUpdate", i.RoomUpdate = "roomUpdate", i.SpeakersChanged = "speakersChanged", i.StreamStateChanged = "streamStateChanged", i.ConnectionQualityUpdate = "connectionQualityUpdate", i.SubscriptionError = "subscriptionError", i.SubscriptionPermissionUpdate = "subscriptionPermissionUpdate", i.RemoteMute = "remoteMute", i.SubscribedQualityUpdate = "subscribedQualityUpdate", i.LocalTrackUnpublished = "localTrackUnpublished", i.LocalTrackSubscribed = "localTrackSubscribed", i.Offline = "offline", i.SignalRequestResponse = "signalRequestResponse", i.SignalConnected = "signalConnected", i.RoomMoved = "roomMoved", i.PublishDataTrackResponse = "publishDataTrackResponse", i.UnPublishDataTrackResponse = "unPublishDataTrackResponse", i.DataTrackSubscriberHandles = "dataTrackSubscriberHandles", i.DataTrackPacketReceived = "dataTrackPacketReceived", i.Joined = "joined", i.TokenRefreshed = "tokenRefreshed", i.ServerRegionsReported = "serverRegionsReported", i.RequestSubscribedCodecRefresh = "requestSubscribedCodecRefresh";
})(P || (P = {}));
var R;
(function(i) {
  i.Message = "message", i.Muted = "muted", i.Unmuted = "unmuted", i.Restarted = "restarted", i.Ended = "ended", i.Subscribed = "subscribed", i.Unsubscribed = "unsubscribed", i.CpuConstrained = "cpuConstrained", i.UpdateSettings = "updateSettings", i.UpdateSubscription = "updateSubscription", i.AudioPlaybackStarted = "audioPlaybackStarted", i.AudioPlaybackFailed = "audioPlaybackFailed", i.AudioSilenceDetected = "audioSilenceDetected", i.VisibilityChanged = "visibilityChanged", i.VideoDimensionsChanged = "videoDimensionsChanged", i.VideoPlaybackStarted = "videoPlaybackStarted", i.VideoPlaybackFailed = "videoPlaybackFailed", i.ElementAttached = "elementAttached", i.ElementDetached = "elementDetached", i.UpstreamPaused = "upstreamPaused", i.UpstreamResumed = "upstreamResumed", i.SubscriptionPermissionChanged = "subscriptionPermissionChanged", i.SubscriptionStatusChanged = "subscriptionStatusChanged", i.SubscriptionFailed = "subscriptionFailed", i.TrackProcessorUpdate = "trackProcessorUpdate", i.AudioTrackFeatureUpdate = "audioTrackFeatureUpdate", i.TranscriptionReceived = "transcriptionReceived", i.TimeSyncUpdate = "timeSyncUpdate", i.PreConnectBufferFlushed = "preConnectBufferFlushed";
})(R || (R = {}));
function kr(i) {
  const e = {};
  for (const n of Object.entries(i)) {
    var t = L(n, 2);
    const r = t[0], s = t[1];
    s !== void 0 && (e[r] = s);
  }
  return e;
}
function Tr(i, e) {
  return i && e ? "".concat(i, "x").concat(e) : void 0;
}
function us(i) {
  return Math.round(i * 1e4) / 1e4;
}
function Pf(i) {
  const e = i.jitterBufferDelay, t = i.jitterBufferEmittedCount;
  return e !== void 0 && t ? us(e / t) : void 0;
}
function Rf(i, e) {
  if (i.playoutDelay !== void 0)
    return us(i.playoutDelay);
  const t = e?.totalPlayoutDelay, n = e?.totalSamplesCount;
  return t !== void 0 && n ? us(t / n) : void 0;
}
function hs(i) {
  var e, t;
  const n = /* @__PURE__ */ new Map(), r = [], s = [], o = [];
  let a;
  i.forEach((p) => n.set(p.id, p));
  const c = (p) => {
    var y;
    return p.codecId ? (y = n.get(p.codecId)) === null || y === void 0 ? void 0 : y.mimeType : void 0;
  }, d = (p, y) => p[y] ? n.get(p[y]) : void 0;
  i.forEach((p) => {
    switch (p.type) {
      case "inbound-rtp": {
        const y = d(p, "playoutId");
        s.push(kr({
          kind: p.kind,
          ssrc: p.ssrc,
          mid: p.mid,
          // matches `streamTrackID` in the track's own log context
          trackId: p.trackIdentifier,
          codec: c(p),
          decoder: p.decoderImplementation,
          resolution: Tr(p.frameWidth, p.frameHeight),
          fps: p.framesPerSecond,
          bytesReceived: p.bytesReceived,
          packetsReceived: p.packetsReceived,
          packetsLost: p.packetsLost,
          packetsDiscarded: p.packetsDiscarded,
          // frames received without frames decoded is a decode failure
          framesReceived: p.framesReceived,
          framesDecoded: p.framesDecoded,
          framesDropped: p.framesDropped,
          keyFramesDecoded: p.keyFramesDecoded,
          freezeCount: p.freezeCount,
          totalFreezesDuration: p.totalFreezesDuration,
          pauseCount: p.pauseCount,
          nackCount: p.nackCount,
          pliCount: p.pliCount,
          firCount: p.firCount,
          jitter: p.jitter,
          jitterBuffer: Pf(p),
          playoutDelay: Rf(p, y),
          audioLevel: p.audioLevel,
          totalSamplesReceived: p.totalSamplesReceived,
          concealedSamples: p.concealedSamples
        }));
        break;
      }
      case "outbound-rtp": {
        const y = d(p, "remoteId"), k = d(p, "mediaSourceId");
        o.push(kr({
          kind: p.kind,
          ssrc: p.ssrc,
          mid: p.mid,
          rid: p.rid,
          trackId: k?.trackIdentifier,
          active: p.active,
          codec: c(p),
          encoder: p.encoderImplementation,
          resolution: Tr(p.frameWidth, p.frameHeight),
          fps: p.framesPerSecond,
          // what the source produces, to tell a stalled capture from a stalled encoder
          captureResolution: Tr(k?.width, k?.height),
          captureFps: k?.framesPerSecond,
          audioLevel: k?.audioLevel,
          targetBitrate: p.targetBitrate,
          bytesSent: p.bytesSent,
          packetsSent: p.packetsSent,
          retransmittedPacketsSent: p.retransmittedPacketsSent,
          framesEncoded: p.framesEncoded,
          keyFramesEncoded: p.keyFramesEncoded,
          limitedBy: p.qualityLimitationReason === "none" ? void 0 : p.qualityLimitationReason,
          nackCount: p.nackCount,
          pliCount: p.pliCount,
          firCount: p.firCount,
          // loss, jitter and RTT are only known from what the remote reports
          remotePacketsLost: y?.packetsLost,
          remoteFractionLost: y?.fractionLost,
          remoteJitter: y?.jitter,
          remoteRoundTripTime: y?.roundTripTime
        }));
        break;
      }
      case "transport":
        a = p;
        break;
      case "candidate-pair":
        r.push(p);
        break;
    }
  });
  const l = a?.selectedCandidatePairId, u = (t = (e = l ? n.get(l) : void 0) !== null && e !== void 0 ? e : r.find((p) => p.selected)) !== null && t !== void 0 ? t : r.find((p) => p.nominated), h = u?.localCandidateId ? n.get(u.localCandidateId) : void 0, f = u?.remoteCandidateId ? n.get(u.remoteCandidateId) : void 0, g = kr({
    ice: a?.iceState,
    dtls: a?.dtlsState,
    route: h && f ? "".concat(h.candidateType, "/").concat(h.protocol, " -> ").concat(f.candidateType) : void 0,
    network: h?.networkType,
    currentRoundTripTime: u?.currentRoundTripTime,
    // the send bandwidth estimate; no RTP stream reports it
    availableOutgoingBitrate: u?.availableOutgoingBitrate,
    availableIncomingBitrate: u?.availableIncomingBitrate,
    bytesSent: u?.bytesSent,
    bytesReceived: u?.bytesReceived,
    candidatePairChanges: a?.selectedCandidatePairChanges
  });
  return {
    connection: Object.keys(g).length > 0 ? g : void 0,
    outbound: o.length > 0 ? o : void 0,
    inbound: s.length > 0 ? s : void 0
  };
}
function If(i) {
  return typeof i > "u" ? i : typeof structuredClone == "function" ? typeof i == "object" && i !== null ? structuredClone(Object.assign({}, i)) : structuredClone(i) : JSON.parse(JSON.stringify(i));
}
function Yd(i, e, t) {
  var n, r, s, o;
  const a = el(i ?? {}), c = a.optionsWithoutProcessor, d = a.audioProcessor, l = a.videoProcessor, u = e?.processor, h = t?.processor, f = c ?? {};
  return f.audio === !0 && (f.audio = {}), f.video === !0 && (f.video = {}), f.audio && (fs(f.audio, e), (n = (s = f.audio).deviceId) !== null && n !== void 0 || (s.deviceId = {
    ideal: "default"
  }), (d || u) && (f.audio.processor = d ?? u)), f.video && (fs(f.video, t), (r = (o = f.video).deviceId) !== null && r !== void 0 || (o.deviceId = {
    ideal: "default"
  }), (l || h) && (f.video.processor = l ?? h)), f;
}
function fs(i, e) {
  return Object.keys(e).forEach((t) => {
    i[t] === void 0 && (i[t] = e[t]);
  }), i;
}
function aa(i) {
  var e, t, n, r;
  const s = {};
  if (i.video)
    if (typeof i.video == "object") {
      const o = {}, a = o, c = i.video;
      Object.keys(c).forEach((d) => {
        d === "resolution" ? fs(a, c.resolution) : a[d] = c[d];
      }), s.video = o, (e = (n = s.video).deviceId) !== null && e !== void 0 || (n.deviceId = {
        ideal: "default"
      });
    } else
      s.video = i.video ? {
        deviceId: {
          ideal: "default"
        }
      } : !1;
  else
    s.video = !1;
  return i.audio ? typeof i.audio == "object" ? (s.audio = i.audio, (t = (r = s.audio).deviceId) !== null && t !== void 0 || (r.deviceId = {
    ideal: "default"
  })) : s.audio = {
    deviceId: {
      ideal: "default"
    }
  } : s.audio = !1, s;
}
function Xd(i) {
  return m(this, arguments, void 0, function(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 200;
    return (function* () {
      const n = Zd();
      if (!n)
        return !1;
      let r, s;
      try {
        s = n.createAnalyser(), s.fftSize = 2048;
        const o = s.frequencyBinCount, a = new Uint8Array(o);
        r = n.createMediaStreamSource(new MediaStream([e.mediaStreamTrack])), r.connect(s);
        const c = () => n.state === "running";
        if (!c()) {
          try {
            yield Promise.race([n.resume(), be(200)]);
          } catch {
          }
          if (!c())
            return !1;
        }
        return yield be(t), s.getByteTimeDomainData(a), !a.some((l) => l !== 128 && l !== 0);
      } finally {
        r?.disconnect(), s?.disconnect(), yield n.close().catch(() => {
        });
      }
    })();
  });
}
function Zd() {
  var i;
  const e = (
    // @ts-ignore
    typeof window < "u" && (window.AudioContext || window.webkitAudioContext)
  );
  if (e) {
    const t = new e({
      latencyHint: "interactive"
    });
    if (t.state === "suspended" && typeof window < "u" && (!((i = window.document) === null || i === void 0) && i.body)) {
      const n = () => m(this, void 0, void 0, function* () {
        var r;
        try {
          t.state === "suspended" && (yield t.resume());
        } catch (s) {
          console.warn("Error trying to auto-resume audio context", s);
        } finally {
          (r = window.document.body) === null || r === void 0 || r.removeEventListener("click", n);
        }
      });
      t.addEventListener("statechange", () => {
        var r;
        t.state === "closed" && ((r = window.document.body) === null || r === void 0 || r.removeEventListener("click", n));
      }), window.document.body.addEventListener("click", n);
    }
    return t;
  }
}
function Af(i) {
  return i === "audioinput" ? C.Source.Microphone : i === "videoinput" ? C.Source.Camera : C.Source.Unknown;
}
function ps(i) {
  return i === C.Source.Microphone ? "audioinput" : i === C.Source.Camera ? "videoinput" : void 0;
}
function xf(i) {
  var e, t;
  let n = (e = i.video) !== null && e !== void 0 ? e : !0;
  return i.resolution && i.resolution.width > 0 && i.resolution.height > 0 && (n = typeof n == "boolean" ? {} : n, Gt() ? n = Object.assign(Object.assign({}, n), {
    width: {
      max: i.resolution.width
    },
    height: {
      max: i.resolution.height
    },
    frameRate: i.resolution.frameRate
  }) : n = Object.assign(Object.assign({}, n), {
    width: {
      ideal: i.resolution.width
    },
    height: {
      ideal: i.resolution.height
    },
    frameRate: i.resolution.frameRate
  })), {
    audio: (t = i.audio) !== null && t !== void 0 ? t : !1,
    video: n,
    // @ts-expect-error support for experimental display media features
    controller: i.controller,
    selfBrowserSurface: i.selfBrowserSurface,
    surfaceSwitching: i.surfaceSwitching,
    systemAudio: i.systemAudio,
    preferCurrentTab: i.preferCurrentTab
  };
}
function Un(i) {
  return i.split("/")[1].toLowerCase();
}
function Mf(i) {
  const e = [];
  return i.forEach((t) => {
    t.track !== void 0 && e.push(new Xs({
      cid: t.track.mediaStreamID,
      track: t.trackInfo
    }));
  }), e;
}
function B(i) {
  return "mediaStreamTrack" in i ? {
    trackID: i.sid,
    source: i.source,
    muted: i.isMuted,
    enabled: i.mediaStreamTrack.enabled,
    kind: i.kind,
    streamID: i.mediaStreamID,
    streamTrackID: i.mediaStreamTrack.id
  } : {
    trackID: i.trackSid,
    enabled: i.isEnabled,
    muted: i.isMuted,
    trackInfo: Object.assign({
      mimeType: i.mimeType,
      name: i.trackName,
      encrypted: i.isEncrypted,
      kind: i.kind,
      source: i.source
    }, i.track ? B(i.track) : {})
  };
}
function Of() {
  return typeof RTCRtpReceiver < "u" && typeof RTCRtpReceiver.prototype.getSynchronizationSources == "function";
}
function Lf(i, e) {
  var t;
  i === void 0 && (i = {}), e === void 0 && (e = {});
  const n = [...Object.keys(e), ...Object.keys(i)], r = {};
  for (const s of n)
    i[s] !== e[s] && (r[s] = (t = e[s]) !== null && t !== void 0 ? t : "");
  return r;
}
function el(i) {
  const e = Object.assign({}, i);
  let t, n;
  return typeof e.audio == "object" && e.audio.processor && (t = e.audio.processor, e.audio = Object.assign(Object.assign({}, e.audio), {
    processor: void 0
  })), typeof e.video == "object" && e.video.processor && (n = e.video.processor, e.video = Object.assign(Object.assign({}, e.video), {
    processor: void 0
  })), {
    audioProcessor: t,
    videoProcessor: n,
    optionsWithoutProcessor: If(e)
  };
}
function Df(i) {
  switch (i) {
    case de.CAMERA:
      return C.Source.Camera;
    case de.MICROPHONE:
      return C.Source.Microphone;
    case de.SCREEN_SHARE:
      return C.Source.ScreenShare;
    case de.SCREEN_SHARE_AUDIO:
      return C.Source.ScreenShareAudio;
    default:
      return C.Source.Unknown;
  }
}
function uo(i, e) {
  return i.width * i.height < e.width * e.height;
}
function Nf(i, e) {
  var t;
  return (t = i.layers) === null || t === void 0 ? void 0 : t.find((n) => n.quality === e);
}
function Uf(i, e) {
  return m(this, arguments, void 0, function(t, n) {
    let r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
    return (function* () {
      var s;
      if (typeof document > "u" || t.readyState === "ended" || t.muted || !t.enabled)
        return !1;
      const o = typeof HTMLVideoElement.prototype.requestVideoFrameCallback == "function", a = r.find((h) => h instanceof HTMLVideoElement && h.srcObject instanceof MediaStream && h.srcObject.getVideoTracks().includes(t) && // without requestVideoFrameCallback we depend on `loadeddata`, which is one-shot: an element
      // that already decoded a frame (readyState >= HAVE_CURRENT_DATA) never fires it again.
      // Leave those alone and set up our own element, which starts out empty.
      (o || h.readyState < 2)), c = a ?? document.createElement("video");
      a || (c.playsInline = !0, c.muted = !0, c.srcObject = new MediaStream([t]), c.play().catch((h) => {
        q.debug("could not play element while waiting for the first video frame", {
          error: h
        });
      }));
      let d, l, u;
      try {
        return yield new Promise((h) => {
          d = setTimeout(() => h(!1), n), o ? l = c.requestVideoFrameCallback(() => h(!0)) : (u = () => h(!0), c.addEventListener("loadeddata", u));
        });
      } finally {
        clearTimeout(d), l !== void 0 && ((s = c.cancelVideoFrameCallback) === null || s === void 0 || s.call(c, l)), u && c.removeEventListener("loadeddata", u), a || (c.pause(), c.srcObject = null);
      }
    })();
  });
}
const Ff = 5e3, In = [];
var De;
(function(i) {
  i[i.LOW = 0] = "LOW", i[i.MEDIUM = 1] = "MEDIUM", i[i.HIGH = 2] = "HIGH";
})(De || (De = {}));
class C extends xe.EventEmitter {
  /**
   * indicates current state of stream, it'll indicate `paused` if the track
   * has been paused by congestion controller
   */
  get streamState() {
    return this._streamState;
  }
  /** @internal */
  setStreamState(e) {
    this._streamState !== e && this.log.debug("stream state changed: ".concat(this._streamState, " -> ").concat(e)), this._streamState = e;
  }
  constructor(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    var r;
    super(), this.attachedElements = [], this.isMuted = !1, this._streamState = C.StreamState.Active, this.isInBackground = !1, this._currentBitrate = 0, this.finalStatsLogged = !1, this.log = q, this.appVisibilityChangedListener = () => {
      this.backgroundTimeout && clearTimeout(this.backgroundTimeout), document.visibilityState === "hidden" ? this.backgroundTimeout = setTimeout(() => this.handleAppVisibilityChanged(), Ff) : this.handleAppVisibilityChanged();
    }, this.loggerContextCb = n.loggerContextCb, this.log = pe((r = n.loggerName) !== null && r !== void 0 ? r : ne.Track, () => this.logContext), this.setMaxListeners(100), this.kind = t, this._mediaStreamTrack = e, this._mediaStreamID = e.id, this.source = C.Source.Unknown;
  }
  get logContext() {
    var e;
    return Object.assign(Object.assign({}, (e = this.loggerContextCb) === null || e === void 0 ? void 0 : e.call(this)), B(this));
  }
  /** current receive bits per second */
  get currentBitrate() {
    return this._currentBitrate;
  }
  get mediaStreamTrack() {
    return this._mediaStreamTrack;
  }
  /**
   * @internal
   * used for keep mediaStream's first id, since it's id might change
   * if we disable/enable a track
   */
  get mediaStreamID() {
    return this._mediaStreamID;
  }
  attach(e) {
    let t = "audio";
    this.kind === C.Kind.Video && (t = "video"), this.attachedElements.length === 0 && this.kind === C.Kind.Video && this.addAppVisibilityListener(), e || (t === "audio" && (In.forEach((s) => {
      s.parentElement === null && !e && (e = s);
    }), e && In.splice(In.indexOf(e), 1)), e || (e = document.createElement(t))), this.attachedElements.includes(e) || this.attachedElements.push(e), sn(this.mediaStreamTrack, e);
    const n = e.srcObject.getTracks(), r = n.some((s) => s.kind === "audio");
    return e.play().then(() => {
      this.emit(r ? R.AudioPlaybackStarted : R.VideoPlaybackStarted);
    }).catch((s) => {
      s.name === "NotAllowedError" ? this.emit(r ? R.AudioPlaybackFailed : R.VideoPlaybackFailed, s) : s.name === "AbortError" ? this.log.debug("".concat(r ? "audio" : "video", " playback aborted, likely due to new play request")) : this.log.warn("could not playback ".concat(r ? "audio" : "video"), {
        error: s
      }), r && e && n.some((o) => o.kind === "video") && s.name === "NotAllowedError" && (e.muted = !0, e.play().catch(() => {
      }));
    }), this.emit(R.ElementAttached, e), e;
  }
  detach(e) {
    try {
      if (e) {
        dn(this.mediaStreamTrack, e);
        const n = this.attachedElements.indexOf(e);
        return n >= 0 && (this.attachedElements.splice(n, 1), this.recycleElement(e), this.emit(R.ElementDetached, e)), e;
      }
      const t = [];
      return this.attachedElements.forEach((n) => {
        dn(this.mediaStreamTrack, n), t.push(n), this.recycleElement(n), this.emit(R.ElementDetached, n);
      }), this.attachedElements = [], t;
    } finally {
      this.attachedElements.length === 0 && this.removeAppVisibilityListener();
    }
  }
  stop() {
    this.log.debug("stopping track"), this.stopMonitor(), this._mediaStreamTrack.stop();
  }
  enable() {
    this._mediaStreamTrack.enabled = !0;
  }
  disable() {
    this._mediaStreamTrack.enabled = !1;
  }
  /* @internal */
  stopMonitor() {
    this.monitorInterval && clearInterval(this.monitorInterval), this.timeSyncHandle !== void 0 && (cancelAnimationFrame(this.timeSyncHandle), this.timeSyncHandle = void 0), this.logFinalStats();
  }
  /**
   * Dumps the raw stats of the track as it ends, once: a track that stops
   * between two of the room's stats dumps is gone by the time the next one runs.
   */
  logFinalStats() {
    this.finalStatsLogged || (this.finalStatsLogged = !0, this.getRTCStatsReport().then((e) => {
      e && this.log.info("final track stats", hs(e));
    }).catch((e) => this.log.debug("could not collect final track stats", {
      error: e
    })));
  }
  /** @internal */
  updateLoggerOptions(e) {
    e.loggerContextCb && (this.loggerContextCb = e.loggerContextCb), e.loggerName && (this.log = pe(e.loggerName, () => this.logContext));
  }
  recycleElement(e) {
    if (e instanceof HTMLAudioElement) {
      let t = !0;
      e.pause(), In.forEach((n) => {
        n.parentElement || (t = !1);
      }), t && In.push(e);
    }
  }
  handleAppVisibilityChanged() {
    return m(this, void 0, void 0, function* () {
      this.isInBackground = document.visibilityState === "hidden", !this.isInBackground && this.kind === C.Kind.Video && setTimeout(() => this.attachedElements.forEach((e) => e.play().catch(() => {
      })), 0);
    });
  }
  addAppVisibilityListener() {
    _e() ? (this.isInBackground = document.visibilityState === "hidden", document.addEventListener("visibilitychange", this.appVisibilityChangedListener)) : this.isInBackground = !1;
  }
  removeAppVisibilityListener() {
    _e() && document.removeEventListener("visibilitychange", this.appVisibilityChangedListener);
  }
}
function sn(i, e) {
  let t;
  e.srcObject instanceof MediaStream ? t = e.srcObject : t = new MediaStream();
  let n;
  i.kind === "audio" ? n = t.getAudioTracks() : n = t.getVideoTracks(), n.includes(i) || (n.forEach((r) => {
    t.removeTrack(r);
  }), t.addTrack(i)), (!Gt() || !(e instanceof HTMLVideoElement)) && (e.autoplay = !0), e.muted = t.getAudioTracks().length === 0, e instanceof HTMLVideoElement && (e.playsInline = !0), e.srcObject !== t && (e.srcObject = t, (Gt() || Qt()) && e instanceof HTMLVideoElement && setTimeout(() => {
    e.srcObject = t, e.play().catch(() => {
    });
  }, 0));
}
function dn(i, e) {
  if (e.srcObject instanceof MediaStream) {
    const t = e.srcObject;
    i.kind === "audio" && ir() && (e.srcObject = null), t.removeTrack(i), t.getTracks().length > 0 ? e.srcObject = t : e.srcObject = null;
  }
}
(function(i) {
  let e;
  (function(d) {
    d.Audio = "audio", d.Video = "video", d.Unknown = "unknown";
  })(e = i.Kind || (i.Kind = {}));
  let t;
  (function(d) {
    d.Camera = "camera", d.Microphone = "microphone", d.ScreenShare = "screen_share", d.ScreenShareAudio = "screen_share_audio", d.Unknown = "unknown";
  })(t = i.Source || (i.Source = {}));
  let n;
  (function(d) {
    d.Active = "active", d.Paused = "paused", d.Unknown = "unknown";
  })(n = i.StreamState || (i.StreamState = {}));
  function r(d) {
    switch (d) {
      case e.Audio:
        return Ke.AUDIO;
      case e.Video:
        return Ke.VIDEO;
      default:
        return Ke.DATA;
    }
  }
  i.kindToProto = r;
  function s(d) {
    switch (d) {
      case Ke.AUDIO:
        return e.Audio;
      case Ke.VIDEO:
        return e.Video;
      default:
        return e.Unknown;
    }
  }
  i.kindFromProto = s;
  function o(d) {
    switch (d) {
      case t.Camera:
        return de.CAMERA;
      case t.Microphone:
        return de.MICROPHONE;
      case t.ScreenShare:
        return de.SCREEN_SHARE;
      case t.ScreenShareAudio:
        return de.SCREEN_SHARE_AUDIO;
      default:
        return de.UNKNOWN;
    }
  }
  i.sourceToProto = o;
  function a(d) {
    switch (d) {
      case de.CAMERA:
        return t.Camera;
      case de.MICROPHONE:
        return t.Microphone;
      case de.SCREEN_SHARE:
        return t.ScreenShare;
      case de.SCREEN_SHARE_AUDIO:
        return t.ScreenShareAudio;
      default:
        return t.Unknown;
    }
  }
  i.sourceFromProto = a;
  function c(d) {
    switch (d) {
      case rs.ACTIVE:
        return n.Active;
      case rs.PAUSED:
        return n.Paused;
      default:
        return n.Unknown;
    }
  }
  i.streamStateFromProto = c;
})(C || (C = {}));
const Bf = "|", ln = "https://aomediacodec.github.io/av1-rtp-spec/#dependency-descriptor-rtp-header-extension";
function tl(i) {
  const e = i.split(Bf);
  return e.length > 1 ? [e[0], i.substr(e[0].length + 1)] : [i, ""];
}
function be(i) {
  return new Ee((e) => z.setTimeout(e, i));
}
function ms() {
  return "addTransceiver" in RTCPeerConnection.prototype;
}
function gs() {
  return "addTrack" in RTCPeerConnection.prototype;
}
function jf() {
  if (!("getCapabilities" in RTCRtpSender) || Gt() || Qt())
    return !1;
  const i = RTCRtpSender.getCapabilities("video");
  let e = !1;
  if (i) {
    for (const t of i.codecs)
      if (t.mimeType.toLowerCase() === "video/av1") {
        e = !0;
        break;
      }
  }
  return e;
}
function qf() {
  if (!("getCapabilities" in RTCRtpSender) || Qt())
    return !1;
  if (Gt()) {
    const t = ke();
    if (t?.version && Ye(t.version, "16") < 0 || t?.os === "iOS" && t?.osVersion && Ye(t.osVersion, "16") < 0)
      return !1;
  }
  const i = RTCRtpSender.getCapabilities("video");
  let e = !1;
  if (i) {
    for (const t of i.codecs)
      if (t.mimeType.toLowerCase() === "video/vp9") {
        e = !0;
        break;
      }
  }
  return e;
}
function Lt(i) {
  return i === "av1" || i === "vp9";
}
function Vf(i) {
  var e;
  const t = (e = i.getHeaderExtensionsToNegotiate) === null || e === void 0 ? void 0 : e.call(i);
  if (!t || !i.setHeaderExtensionsToNegotiate)
    return !1;
  const n = t.find((r) => r.uri === ln);
  if (!n)
    return !1;
  if (n.direction !== "stopped")
    return !0;
  n.direction = "sendrecv";
  try {
    return i.setHeaderExtensionsToNegotiate(t), !0;
  } catch {
    return !1;
  }
}
function un(i, e) {
  var t;
  return Lt(i) && !!e?.simulcast && !!(!((t = e.scalabilityMode) === null || t === void 0) && t.startsWith("L1T"));
}
function nl() {
  const i = ke();
  return $n() || // Even tho RN runs M114, it does not produce SVC layers when a single encoding
  // is provided. So we'll use the legacy SVC specification for now.
  // TODO: when we upstream libwebrtc, this will need additional verification
  qe() || i?.name === "Chrome" && Ye(i.version, "113") < 0;
}
const Wf = "1.13.6";
function Hf(i) {
  return i ? Ye(i, Wf) > 0 : !1;
}
function vs(i) {
  return !document || $n() ? !1 : (i || (i = document.createElement("audio")), "setSinkId" in i);
}
function zf() {
  return typeof RTCPeerConnection > "u" ? !1 : ms() || gs();
}
function Qt() {
  var i;
  return ((i = ke()) === null || i === void 0 ? void 0 : i.name) === "Firefox";
}
function ir() {
  const i = ke();
  return !!i && i.name === "Chrome" && i.os !== "iOS";
}
function bs() {
  return typeof window < "u" && // @ts-ignore
  typeof window.RTCRtpScriptTransform < "u" && !ir();
}
function Gt() {
  var i;
  return ((i = ke()) === null || i === void 0 ? void 0 : i.name) === "Safari";
}
function $n() {
  const i = ke();
  return i?.name === "Safari" || i?.os === "iOS";
}
function Kf() {
  if (!_e())
    return !1;
  const i = ke();
  return i?.name === "Safari" && i?.os === "macOS" && navigator.maxTouchPoints > 1;
}
function Gf() {
  var i;
  return ((i = ke()) === null || i === void 0 ? void 0 : i.os) === "iOS" || Kf();
}
function Jf() {
  const i = ke();
  return i?.name === "Safari" && i.version.startsWith("17.") || i?.os === "iOS" && !!i?.osVersion && Ye(i.osVersion, "17") >= 0;
}
function $f(i) {
  return i || (i = ke()), i?.name === "Safari" && Ye(i.version, "18.3") > 0 || i?.os === "iOS" && !!i?.osVersion && Ye(i.osVersion, "18.3") > 0;
}
function il() {
  var i, e;
  return _e() ? (
    // @ts-expect-error `userAgentData` is not yet part of typescript
    (e = (i = navigator.userAgentData) === null || i === void 0 ? void 0 : i.mobile) !== null && e !== void 0 ? e : /Tablet|iPad|Mobile|Android|BlackBerry/.test(navigator.userAgent)
  ) : !1;
}
function Qf() {
  const i = ke(), e = "17.2";
  if (i)
    return i.name !== "Safari" && i.os !== "iOS" || i.os === "iOS" && i.osVersion && Ye(i.osVersion, e) >= 0 ? !0 : i.name === "Safari" && Ye(i.version, e) >= 0;
}
function _e() {
  return typeof document < "u";
}
function qe() {
  return navigator.product == "ReactNative";
}
function Sn(i) {
  return i.hostname.endsWith(".livekit.cloud") || i.hostname.endsWith(".livekit.run");
}
function Sr(i) {
  return Sn(i) ? i.hostname.split(".")[0] : null;
}
function rl() {
  if (global && global.LiveKitReactNativeGlobal)
    return global.LiveKitReactNativeGlobal;
}
function sl() {
  if (!qe())
    return;
  let i = rl();
  if (i)
    return i.platform;
}
function ho() {
  if (_e())
    return window.devicePixelRatio;
  if (qe()) {
    let i = rl();
    if (i)
      return i.devicePixelRatio;
  }
  return 1;
}
function Ye(i, e) {
  const t = i.split("."), n = e.split("."), r = Math.min(t.length, n.length);
  for (let s = 0; s < r; ++s) {
    const o = parseInt(t[s], 10), a = parseInt(n[s], 10);
    if (o > a) return 1;
    if (o < a) return -1;
    if (s === r - 1 && o === a) return 0;
  }
  return i === "" && e !== "" ? -1 : e === "" ? 1 : t.length == n.length ? 0 : t.length < n.length ? -1 : 1;
}
function Yf(i) {
  for (const e of i)
    e.target.handleResize(e);
}
function Xf(i) {
  for (const e of i)
    e.target.handleVisibilityChanged(e);
}
let Cr = null;
const fo = () => (Cr || (Cr = new ResizeObserver(Yf)), Cr);
let wr = null;
const po = () => (wr || (wr = new IntersectionObserver(Xf, {
  root: null,
  rootMargin: "0px"
})), wr);
function Zf(i) {
  var e;
  const t = new Ad({
    capabilities: i,
    sdk: xd.JS,
    protocol: Sf,
    clientProtocol: Cf,
    version: Tf
  });
  return qe() && (t.os = (e = sl()) !== null && e !== void 0 ? e : ""), t;
}
function mo() {
  let i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 16, e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 16, t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !1, n = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
  const r = document.createElement("canvas");
  r.width = i, r.height = e;
  const s = r.getContext("2d");
  s?.fillRect(0, 0, r.width, r.height), n && s && (s.beginPath(), s.arc(i / 2, e / 2, 50, 0, Math.PI * 2, !0), s.closePath(), s.fillStyle = "grey", s.fill());
  const a = r.captureStream().getTracks(), c = L(a, 1), d = c[0];
  if (!d)
    throw Error("Could not get empty media stream video track");
  return d.enabled = t, d;
}
let mt, ys;
const ks = /* @__PURE__ */ new Set();
function al() {
  if (!mt) {
    const n = new AudioContext(), r = n.createOscillator(), s = n.createGain();
    s.gain.setValueAtTime(0, 0);
    const o = n.createMediaStreamDestination();
    r.connect(s), s.connect(o), r.start();
    var i = o.stream.getAudioTracks(), e = L(i, 1);
    if (mt = e[0], !mt)
      throw n.close().catch(() => {
      }), Error("Could not get empty media stream audio track");
    mt.enabled = !1, ys = n;
  }
  const t = mt.clone();
  return ks.add(t), t;
}
function go(i) {
  return m(this, void 0, void 0, function* () {
    if (!ks.delete(i) || (i.stop(), ks.size > 0))
      return;
    const e = ys;
    mt?.stop(), mt = void 0, ys = void 0, yield e?.close();
  });
}
class ye {
  get isResolved() {
    return this._isResolved;
  }
  constructor(e, t) {
    this._isResolved = !1, this.onFinally = t, this.promise = new Promise((n, r) => m(this, void 0, void 0, function* () {
      this.resolve = n, this.reject = r, e && (yield e(n, r));
    })).finally(() => {
      var n;
      this._isResolved = !0, (n = this.onFinally) === null || n === void 0 || n.call(this);
    });
  }
}
function ol(i) {
  return uu.includes(i);
}
function hn(i) {
  if (typeof i == "string" || typeof i == "number")
    return i;
  if (Array.isArray(i))
    return i[0];
  if (i.exact !== void 0)
    return Array.isArray(i.exact) ? i.exact[0] : i.exact;
  if (i.ideal !== void 0)
    return Array.isArray(i.ideal) ? i.ideal[0] : i.ideal;
  throw Error("could not unwrap constraint");
}
function ep(i) {
  return typeof i == "object" && i !== null && "name" in i && (i.name === "NotAllowedError" || i.name === "SecurityError" || i.name === "PermissionDeniedError" || i.name === "PermissionDismissedError");
}
const cl = /* @__PURE__ */ new WeakSet();
function tp(i) {
  typeof i == "object" && i !== null && cl.add(i);
}
function np(i) {
  return typeof i == "object" && i !== null && cl.has(i);
}
function ip(i) {
  return i.startsWith("http") ? i.replace(/^(http)/, "ws") : i;
}
function Qn(i) {
  return i.startsWith("ws") ? i.replace(/^(ws)/, "http") : i;
}
function rp(i, e) {
  return i.segments.map((t) => {
    let n = t.id, r = t.text, s = t.language, o = t.startTime, a = t.endTime, c = t.final;
    var d;
    const l = (d = e.get(n)) !== null && d !== void 0 ? d : Date.now(), u = Date.now();
    return c ? e.delete(n) : e.set(n, l), {
      id: n,
      text: r,
      startTime: Number.parseInt(o.toString()),
      endTime: Number.parseInt(a.toString()),
      final: c,
      language: s,
      firstReceivedTime: l,
      lastReceivedTime: u
    };
  });
}
function sp(i) {
  const e = i.id, t = i.timestamp, n = i.message, r = i.editTimestamp;
  return {
    id: e,
    timestamp: Number.parseInt(t.toString()),
    editTimestamp: r ? Number.parseInt(r.toString()) : void 0,
    message: n
  };
}
function vo(i) {
  switch (i.reason) {
    case J.LeaveRequest:
      return i.context;
    case J.Cancelled:
      return Le.CLIENT_INITIATED;
    case J.NotAllowed:
      return Le.USER_REJECTED;
    case J.ServerUnreachable:
      return Le.JOIN_FAILURE;
    default:
      return Le.UNKNOWN_REASON;
  }
}
function tn(i) {
  return i !== void 0 ? Number(i) : void 0;
}
function Qe(i) {
  return i !== void 0 ? BigInt(i) : void 0;
}
function fn(i) {
  return !!i && !(i instanceof MediaStreamTrack) && i.isLocal;
}
function at(i) {
  return !!i && i.kind == C.Kind.Audio;
}
function yt(i) {
  return !!i && i.kind == C.Kind.Video;
}
function Fe(i) {
  return fn(i) && yt(i);
}
function et(i) {
  return fn(i) && at(i);
}
function Ts(i) {
  return !!i && !i.isLocal;
}
function ap(i) {
  return !!i && !i.isLocal;
}
function Er(i) {
  return Ts(i) && yt(i);
}
function op(i) {
  return i.isLocal;
}
function cp(i, e) {
  const t = [];
  let n = new TextEncoder().encode(i);
  for (; n.length > e; ) {
    let r = e;
    for (; r > 0; ) {
      const s = n[r];
      if (s !== void 0 && (s & 192) !== 128)
        break;
      r--;
    }
    t.push(n.slice(0, r)), n = n.slice(r);
  }
  return n.length > 0 && t.push(n), t;
}
function xi(i) {
  return new ReadableStream({
    start(e) {
      e.enqueue(i), e.close();
    }
  });
}
function dp(i, e) {
  return Gd(this, arguments, function* () {
    const n = i.getReader();
    let r = new Uint8Array(0);
    try {
      for (; ; ) {
        const s = yield bt(n.read()), o = s.done, a = s.value;
        if (o)
          break;
        if (a.byteLength === 0)
          continue;
        const c = new Uint8Array(r.byteLength + a.byteLength);
        for (c.set(r), c.set(a, r.byteLength), r = c; r.byteLength >= e; )
          yield yield bt(r.slice(0, e)), r = r.slice(e);
      }
      r.byteLength > 0 && (yield yield bt(r));
    } finally {
      n.releaseLock();
    }
  });
}
function lp(i) {
  var e;
  const t = i.get("Cache-Control");
  if (t) {
    const n = (e = t.match(/(?:^|[,\s])max-age=(\d+)/)) === null || e === void 0 ? void 0 : e[1];
    if (n)
      return parseInt(n, 10);
  }
}
function dl() {
  return typeof CompressionStream < "u";
}
let _r = null;
function pn() {
  return typeof _r != "boolean" && (_r = up()), _r;
}
function up() {
  if (typeof CompressionStream > "u" || typeof DecompressionStream > "u")
    return !1;
  try {
    return new CompressionStream("deflate-raw"), new DecompressionStream("deflate-raw"), !0;
  } catch {
    return !1;
  }
}
function hp() {
  return dl() && !Qt();
}
function bo(i, e) {
  const t = tl(e.id), n = L(t, 2), r = n[1];
  if (r?.startsWith("TR"))
    return r;
  if (i.id.startsWith("TR"))
    return i.id;
}
function fp(i, e) {
  let t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !1;
  const n = pp(i, e);
  return t ? n : oa(n, "v1");
}
function pp(i, e) {
  const t = new URL(ip(i));
  return e.forEach((n, r) => {
    t.searchParams.set(r, n);
  }), oa(t, "rtc");
}
function mp(i) {
  const e = new URL(Qn(i));
  return oa(e, "validate");
}
function ll(i) {
  return i.endsWith("/") ? i : "".concat(i, "/");
}
function oa(i, e) {
  return i.pathname = "".concat(ll(i.pathname)).concat(e), i;
}
function yo(i) {
  if (typeof i == "string")
    return io.fromJson(JSON.parse(i), {
      ignoreUnknownFields: !0
    });
  if (i instanceof ArrayBuffer)
    return io.fromBinary(new Uint8Array(i));
  throw new Error("could not decode websocket message: ".concat(typeof i));
}
function gp(i) {
  let e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "Unknown reason";
  if (i instanceof Error)
    return i.message;
  if (!(i instanceof AbortSignal))
    return e;
  const t = i.reason;
  switch (typeof t) {
    case "string":
      return t;
    case "object":
      return t instanceof Error ? t.message : e;
    default:
      return "toString" in t ? t.toString() : e;
  }
}
function vp(i, e) {
  return i instanceof Error ? i.name && i.message ? "".concat(i.name, ": ").concat(i.message) : i.name : "Encountered unknown ".concat(e, " error: ").concat(String(i));
}
const bp = 10, ui = "lk_e2ee", hi = "lk_e2ee_track_id", yp = "LKFrameEncryptionKey", kp = {
  sharedKey: !1,
  ratchetSalt: yp,
  ratchetWindowSize: 8,
  failureTolerance: bp,
  keyringSize: 16,
  keySize: 128
};
function Tp() {
  return ca() || Sp();
}
function Sp() {
  return typeof window < "u" && typeof window.RTCRtpScriptTransform < "u";
}
function ca() {
  return typeof window < "u" && typeof window.RTCRtpSender < "u" && // @ts-ignore
  typeof window.RTCRtpSender.prototype.createEncodedStreams < "u";
}
function Cp(i) {
  var e, t, n, r, s;
  if (((e = i.value) === null || e === void 0 ? void 0 : e.case) !== "sipDtmf" && ((t = i.value) === null || t === void 0 ? void 0 : t.case) !== "metrics" && ((n = i.value) === null || n === void 0 ? void 0 : n.case) !== "speaker" && ((r = i.value) === null || r === void 0 ? void 0 : r.case) !== "transcription" && ((s = i.value) === null || s === void 0 ? void 0 : s.case) !== "encryptedPacket")
    return new Cd({
      value: i.value
    });
}
function Yn() {
  return bs();
}
function Xn(i) {
  return !!i?.worker && (ca() || Yn());
}
function Ui(i) {
  return !!(i?.timestamp || i?.frameId);
}
function wp(i) {
  const e = [];
  return i?.timestamp && e.push(kn.PTF_USER_TIMESTAMP), i?.frameId && e.push(kn.PTF_FRAME_ID), e;
}
function Ep(i) {
  if (!i || i.length === 0)
    return;
  const e = {};
  return i.includes(kn.PTF_USER_TIMESTAMP) && (e.timestamp = !0), i.includes(kn.PTF_FRAME_ID) && (e.frameId = !0), e.timestamp || e.frameId ? e : void 0;
}
function da(i) {
  var e;
  return (e = i?.frameMetadata) !== null && e !== void 0 ? e : i?.packetTrailer;
}
function Pr(i, e) {
  i.frameMetadata = e, i.packetTrailer = e;
}
const _p = 500, Pp = 15e3;
class mn {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {
    this.failedConnectionAttempts = /* @__PURE__ */ new Map(), this.backOffPromises = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    return this._instance || (this._instance = new mn()), this._instance;
  }
  addFailedConnectionAttempt(e) {
    var t;
    const n = new URL(e), r = Sr(n);
    if (!r)
      return;
    let s = (t = this.failedConnectionAttempts.get(r)) !== null && t !== void 0 ? t : 0;
    this.failedConnectionAttempts.set(r, s + 1), this.backOffPromises.set(r, be(Math.min(_p * Math.pow(2, s), Pp)));
  }
  getBackOffPromise(e) {
    const t = new URL(e), n = t && Sr(t);
    return n && this.backOffPromises.get(n) || Promise.resolve();
  }
  resetFailedConnectionAttempts(e) {
    const t = new URL(e), n = t && Sr(t);
    n && (this.failedConnectionAttempts.set(n, 0), this.backOffPromises.set(n, Promise.resolve()));
  }
  resetAll() {
    this.backOffPromises.clear(), this.failedConnectionAttempts.clear();
  }
}
mn._instance = null;
const Rr = "default";
class he {
  constructor() {
    this._previousDevices = [];
  }
  static getInstance() {
    return this.instance === void 0 && (this.instance = new he()), this.instance;
  }
  get previousDevices() {
    return this._previousDevices;
  }
  getDevices(e) {
    return m(this, arguments, void 0, function(t) {
      var n = this;
      let r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
      return (function* () {
        var s;
        if (((s = he.userMediaPromiseMap) === null || s === void 0 ? void 0 : s.size) > 0) {
          q.debug("awaiting getUserMedia promise");
          try {
            t ? yield he.userMediaPromiseMap.get(t) : yield Promise.all(he.userMediaPromiseMap.values());
          } catch {
            q.warn("error waiting for media permissons");
          }
        }
        let o = yield navigator.mediaDevices.enumerateDevices();
        if (r && // for safari we need to skip this check, as otherwise it will re-acquire user media and fail on iOS https://bugs.webkit.org/show_bug.cgi?id=179363
        !(Gt() && n.hasDeviceInUse(t)) && (o.filter((c) => !t || c.kind === t).length === 0 || o.some((c) => {
          const d = c.label === "", l = t ? c.kind === t : !0;
          return d && l;
        }))) {
          const c = {
            video: t !== "audioinput" && t !== "audiooutput",
            audio: t !== "videoinput" && {
              deviceId: {
                ideal: "default"
              }
            }
          }, d = yield navigator.mediaDevices.getUserMedia(c);
          o = yield navigator.mediaDevices.enumerateDevices(), d.getTracks().forEach((l) => {
            l.stop();
          });
        }
        return n._previousDevices = o, t && (o = o.filter((a) => a.kind === t)), o;
      })();
    });
  }
  normalizeDeviceId(e, t, n) {
    return m(this, void 0, void 0, function* () {
      if (t !== Rr)
        return t;
      const r = yield this.getDevices(e), s = r.find((a) => a.deviceId === Rr);
      if (!s) {
        q.warn("could not reliably determine default device");
        return;
      }
      const o = r.find((a) => a.deviceId !== Rr && a.groupId === (n ?? s.groupId));
      if (!o) {
        q.warn("could not reliably determine default device");
        return;
      }
      return o?.deviceId;
    });
  }
  hasDeviceInUse(e) {
    return e ? he.userMediaPromiseMap.has(e) : he.userMediaPromiseMap.size > 0;
  }
}
he.mediaDeviceKinds = ["audioinput", "audiooutput", "videoinput"];
he.userMediaPromiseMap = /* @__PURE__ */ new Map();
var Fn;
(function(i) {
  i[i.WAITING = 0] = "WAITING", i[i.RUNNING = 1] = "RUNNING", i[i.COMPLETED = 2] = "COMPLETED";
})(Fn || (Fn = {}));
class Rp {
  constructor() {
    this.pendingTasks = /* @__PURE__ */ new Map(), this.taskMutex = new fe(), this.nextTaskIndex = 0;
  }
  run(e) {
    return m(this, void 0, void 0, function* () {
      const t = {
        id: this.nextTaskIndex++,
        enqueuedAt: Date.now(),
        status: Fn.WAITING
      };
      this.pendingTasks.set(t.id, t);
      const n = yield this.taskMutex.lock();
      try {
        return t.executedAt = Date.now(), t.status = Fn.RUNNING, yield e();
      } finally {
        t.status = Fn.COMPLETED, this.pendingTasks.delete(t.id), n();
      }
    });
  }
  flush() {
    return m(this, void 0, void 0, function* () {
      return this.run(() => m(this, void 0, void 0, function* () {
      }));
    });
  }
  snapshot() {
    return Array.from(this.pendingTasks.values());
  }
}
function ul(i) {
  if (i.length === 0)
    return new AbortController().signal;
  if (i.length === 1)
    return i[0];
  for (const r of i)
    if (r.aborted)
      return r;
  const e = new AbortController(), t = Array(i.length), n = () => {
    for (const r of t)
      r();
  };
  return i.forEach((r, s) => {
    const o = () => {
      e.abort(r.reason), n();
    };
    r.addEventListener("abort", o), t[s] = () => r.removeEventListener("abort", o);
  }), e.signal;
}
function la(i) {
  const e = new AbortController();
  return setTimeout(() => {
    e.abort(new DOMException("signal timed out after ".concat(i, " ms"), "TimeoutError"));
  }, i), e.signal;
}
const Ip = ["client"];
var hl = class {
  constructor() {
    D(this, "listeners", /* @__PURE__ */ new Map());
  }
  on(e, t) {
    let n = this.listeners.get(e);
    return n || (n = /* @__PURE__ */ new Set(), this.listeners.set(e, n)), n.add(t), {
      off: () => {
        n.delete(t);
      }
    };
  }
  /**
  * Emit a named event, notifying wildcard listeners first, then named listeners.
  *
  * Wildcard listeners receive `(eventName, data)`; named listeners receive
  * only `data`. The firing order (wildcards before named) is intentional —
  * it lets relay listeners (like Fsm's bfsm proxy) observe all events
  * before specific subscribers react.
  */
  emit(e, t) {
    const n = this.listeners.get("*");
    if (n) for (const s of n) s(e, t);
    const r = this.listeners.get(e);
    if (r) for (const s of r) s(t);
  }
  /**
  * Remove all listeners (named and wildcard).
  *
  * Existing `Subscription` objects remain valid — their `off()` closures
  * hold a reference to the now-empty Set, so calling them is harmless.
  * Called by `dispose()` to prevent memory retention after an FSM shuts down.
  */
  clear() {
    this.listeners.clear();
  }
}, gn = class extends Error {
  constructor(i, e) {
    super("non-serializable value at ".concat(i, " (").concat(e, ")")), this.path = i, this.label = e;
  }
};
const Ap = (i, e) => Ss(i, e, /* @__PURE__ */ new Set()), Ss = (i, e, t) => {
  if (i === null) return null;
  switch (typeof i) {
    case "string":
    case "boolean":
      return i;
    case "number":
      if (!Number.isFinite(i)) throw new gn(e, Mp(i));
      return i;
    case "object":
      return xp(i, e, t);
    default:
      throw new gn(e, typeof i);
  }
}, xp = (i, e, t) => {
  var n, r;
  if (t.has(i)) throw new gn(e, "circular reference");
  if (Array.isArray(i)) {
    if (i.length !== Object.keys(i).length) throw new gn(e, "sparse array or array with non-index properties");
    t.add(i);
    const a = i.map((c, d) => Ss(c, "".concat(e, "[").concat(d, "]"), t));
    return t.delete(i), a;
  }
  const s = Object.getPrototypeOf(i);
  if (s !== Object.prototype && s !== null) throw new gn(e, (n = (r = i.constructor) === null || r === void 0 ? void 0 : r.name) !== null && n !== void 0 ? n : "object");
  t.add(i);
  const o = {};
  for (const a of Object.keys(i)) {
    const c = Ss(i[a], "".concat(e, ".").concat(a), t);
    Object.defineProperty(o, a, {
      value: c,
      enumerable: !0,
      writable: !0,
      configurable: !0
    });
  }
  return t.delete(i), o;
}, Mp = (i) => Number.isNaN(i) ? "NaN" : i > 0 ? "Infinity" : "-Infinity", Cs = function(i) {
  let e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : /* @__PURE__ */ new Set();
  if (i === null || typeof i != "object" || e.has(i)) return i;
  if (Array.isArray(i)) {
    e.add(i);
    const r = i.map((s) => Cs(s, e));
    return e.delete(i), r;
  }
  const t = Object.getPrototypeOf(i);
  if (t !== Object.prototype && t !== null) return i;
  e.add(i);
  const n = {};
  for (const r of Object.keys(i)) {
    const s = Cs(i[r], e);
    Object.defineProperty(n, r, {
      value: s,
      enumerable: !0,
      writable: !0,
      configurable: !0
    });
  }
  return e.delete(i), n;
}, Bn = /* @__PURE__ */ Symbol("machina.type"), ko = 20;
var Op = class {
  constructor(e) {
    D(this, "id", void 0), D(this, "initialState", void 0), D(this, Bn, "BehavioralFsm"), D(this, "states", void 0), D(this, "emitter", new hl()), D(this, "clients", /* @__PURE__ */ new WeakMap()), D(this, "knownClients", /* @__PURE__ */ new Set()), D(this, "childSubscriptions", []), D(this, "disposed", !1), D(this, "transitionDepth", 0), this.id = e.id, this.initialState = e.initialState, this.states = e.states, this.wrapChildLinks(), this.setupChildSubscriptions();
  }
  /**
  * Dispatch an input to the given client's current state handler.
  *
  * Delegation order: if the current state has a `_child` FSM that can
  * handle the input, it is dispatched there. If the child emits `nohandler`,
  * the input bubbles up to this FSM's local handler. If no handler exists
  * here either, `nohandler` is emitted on this FSM's emitter.
  *
  * No-ops silently when disposed.
  */
  handle(e, t) {
    var n;
    if (this.disposed) return;
    const r = this.getOrCreateClientMeta(e);
    for (var s = arguments.length, o = new Array(s > 2 ? s - 2 : 0), a = 2; a < s; a++)
      o[a - 2] = arguments[a];
    r.currentActionArgs = o;
    const c = (n = this.states[r.state]) === null || n === void 0 ? void 0 : n._child;
    if (c && c.canHandle(e, t)) {
      try {
        c.handle(e, t, ...o);
      } finally {
        r.currentActionArgs = void 0;
      }
      return;
    }
    this.handleLocally(e, t, o, r);
  }
  /**
  * Returns true if the client's current state has a handler for `inputName`
  * (or a catch-all `"*"` handler), or if the current state's `_child` chain
  * can handle it — the check recurses to the same depth `handle()`'s
  * delegation can actually reach, so a grandchild-only input answers true
  * from the root. Does NOT initialize the client — no `_onEnter`, no
  * events, no side effects. Unseen clients are treated as if they were
  * already in `initialState`. Returns false when disposed.
  */
  canHandle(e, t) {
    var n, r, s;
    if (this.disposed) return !1;
    const o = (n = (r = this.clients.get(e)) === null || r === void 0 ? void 0 : r.state) !== null && n !== void 0 ? n : this.initialState, a = this.states[o];
    if ((s = a?.[t]) !== null && s !== void 0 ? s : a?.["*"]) return !0;
    const c = a?._child;
    return c ? c.canHandle(e, t) : !1;
  }
  /**
  * Transition the client back to `initialState`, firing `_onEnter` and
  * lifecycle events as if entering it fresh. No-ops when disposed.
  */
  reset(e) {
    this.disposed || this.transition(e, this.initialState);
  }
  /**
  * Returns the client's current state, or `undefined` if the client has
  * never been initialized (i.e. `handle()`, `transition()`, or `reset()`
  * have never been called for it). Does NOT trigger initialization.
  */
  currentState(e) {
    var t;
    return (t = this.clients.get(e)) === null || t === void 0 ? void 0 : t.state;
  }
  /**
  * Directly transition `client` to `toState`, running the full lifecycle:
  * `_onExit` for the current state → `transitioning` event → update state →
  * `_onEnter` for new state → `transitioned` event → child reset → deferred
  * queue replay → bounce (if `_onEnter` returned a state name).
  *
  * Same-state transitions are silently ignored. Transitions to unknown state
  * names emit `invalidstate` instead of throwing. Throws if the transition
  * depth exceeds `MAX_TRANSITION_DEPTH` (likely an `_onEnter` → transition loop).
  *
  * No-ops when disposed.
  */
  transition(e, t) {
    if (this.disposed) return;
    const n = this.getOrCreateClientMeta(e), r = n.state;
    if (t !== r) {
      if (!Object.hasOwn(this.states, t)) {
        this.emitter.emit("invalidstate", {
          stateName: t,
          client: e
        });
        return;
      }
      if (this.transitionDepth++, this.transitionDepth > ko)
        throw this.transitionDepth = 0, new Error("Max transition depth (".concat(ko, ') exceeded in FSM "').concat(this.id, '". Likely an infinite _onEnter → transition loop.'));
      try {
        const s = this.states[r], o = this.states[t];
        if (s != null && s._onExit && typeof s._onExit == "function") {
          const l = this.buildHandlerArgs(e, "", n);
          s._onExit(l);
        }
        n.state = t;
        const a = {
          fromState: r,
          toState: t,
          client: e
        };
        this.emitter.emit("transitioning", a);
        let c;
        if (o != null && o._onEnter && typeof o._onEnter == "function") {
          const l = this.buildHandlerArgs(e, "", n);
          c = o._onEnter(l);
        }
        this.emitter.emit("transitioned", a);
        const d = o?._child;
        d && d.reset(e), this.processQueue(e, n), typeof c == "string" && n.state === t && this.transition(e, c);
      } finally {
        this.transitionDepth--;
      }
    }
  }
  /**
  * Returns the client's state as a dot-delimited path including any active
  * child FSM states (e.g. `"active.connecting.retrying"`). Returns just the
  * current state name when no child is active. Returns `""` for clients that
  * have never been initialized (unlike `currentState()` which returns `undefined`).
  */
  compositeState(e) {
    var t;
    const n = this.clients.get(e);
    if (!n) return "";
    const r = (t = this.states[n.state]) === null || t === void 0 ? void 0 : t._child;
    if (r) {
      const s = r.compositeState(e);
      if (s) return "".concat(n.state, ".").concat(s);
    }
    return n.state;
  }
  rehydrate(e, t) {
    if (this.disposed) return;
    if (typeof t == "string") {
      this.rehydrateCompositePath(e, t);
      return;
    }
    const n = this.planSnapshotWrites(e, t);
    for (const r of n) r();
  }
  /**
  * Snapshot everything machina tracks for `client`: current state, pending
  * deferred inputs, and — recursively — the same for every `_child` that has
  * ever seen this client, active or not. Feed the result to the object form
  * of `rehydrate()` to restore it later, deferrals included.
  *
  * Returns `undefined` for a client this FSM has never seen (mirrors
  * `currentState()`) — the call does NOT trigger initialization.
  *
  * Throws if any deferred input's args contain a non-serializable value
  * (function, undefined, symbol, bigint, non-finite number, Date/Map/class
  * instance, or a circular reference) — naming the input, its `until` target
  * if any, the FSM id, and the exact value path. Throws for an Fsm child
  * that's on `client`'s active path *relative to the true root* (consistent
  * with `rehydrate()`'s conditional throw) — an Fsm owns its own context, so
  * there's nothing per-client to snapshot. An Fsm child declared at a state
  * `client` never visited, OR nested under a `BehavioralFsm` child that is
  * itself off-path from the root, is skipped rather than throwing — neither
  * has any per-client state to lose, so one Fsm child anywhere in the
  * hierarchy doesn't disable `dehydrate()` for clients that never reach that
  * branch, no matter how deeply nested the Fsm child is.
  *
  * Meant for clients at rest between `handle()` calls — `currentActionArgs`
  * (the in-flight args mid-handler) has no meaning here and is excluded.
  *
  * @param isOnActivePath - @internal Whether this FSM itself is currently
  * reachable from the true root's active path. Defaults to `true` for the
  * public entry point (this FSM IS the root from its own perspective); the
  * `ChildLink` adapter passes `false` down when recursing into a nested
  * `BehavioralFsm` child that is itself off-path, so that child's own
  * Fsm-child checks don't recompute reachability from its dormant local
  * state alone.
  */
  dehydrate(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
    const n = this.clients.get(e);
    if (!n) return;
    const r = {
      state: n.state,
      deferred: n.deferredQueue.map((o) => this.snapshotDeferredInput(o))
    }, s = this.collectChildSnapshots(e, n.state, t);
    return s && (r.children = s), r;
  }
  /**
  * @internal
  * Validates `snapshot` against this level's state graph and recurses into
  * every declared child, returning write thunks to run only once the WHOLE
  * tree — every level — validates successfully. Nothing is written here.
  * Called by the object-form of `rehydrate()` and, recursively, by ChildLink
  * so a nested BehavioralFsm participates in the same validate-then-write
  * pass. Not part of the public persistence API — call `rehydrate()` instead.
  */
  planSnapshotWrites(e, t) {
    if (this.disposed) return [];
    const n = t.state, r = t.deferred, s = t.children;
    if (!Object.hasOwn(this.states, n)) throw new Error('rehydrate: unknown state "'.concat(n, '" in FSM "').concat(this.id, '". Valid states: ').concat(Object.keys(this.states).join(", ")));
    const o = [];
    if (s) for (const d of Object.keys(s)) {
      var a;
      if (!Object.hasOwn(this.states, d)) throw new Error('rehydrate: unknown state "'.concat(d, '" in FSM "').concat(this.id, '" referenced by snapshot.children.'));
      const l = (a = this.states[d]) === null || a === void 0 ? void 0 : a._child;
      if (!l) throw new Error('rehydrate: state "'.concat(d, '" in FSM "').concat(this.id, '" has no _child, but the snapshot has a children["').concat(d, '"] entry.'));
      o.push(...l.planRehydrate(e, s[d]));
    }
    const c = r.map((d) => Au({
      inputName: d.inputName,
      args: Cs(d.args)
    }, d.untilState !== void 0 ? {
      untilState: d.untilState
    } : {}));
    return o.push(() => {
      this.clients.has(e) || this.knownClients.add(new WeakRef(e)), this.clients.set(e, {
        state: n,
        deferredQueue: c
      });
    }), o;
  }
  rehydrateCompositePath(e, t) {
    const n = t.split("."), r = Ou(n), s = r[0], o = ns(r).slice(1);
    if (!Object.hasOwn(this.states, s)) throw new Error('rehydrate: unknown state "'.concat(s, '" in FSM "').concat(this.id, '". Valid states: ').concat(Object.keys(this.states).join(", ")));
    if (o.length > 0) {
      var a;
      const c = o.join("."), d = (a = this.states[s]) === null || a === void 0 ? void 0 : a._child;
      if (!d) throw new Error('rehydrate: state "'.concat(s, '" in FSM "').concat(this.id, '" has no _child, but composite path "').concat(t, '" requires one.'));
      d.rehydrate(e, c);
    }
    this.clients.has(e) || this.knownClients.add(new WeakRef(e)), this.clients.set(e, {
      state: s,
      deferredQueue: []
    });
  }
  /**
  * Walks every declared state's `_child`, dehydrating each one that has ever
  * seen `client`. The same child instance can be declared under multiple
  * state names (shared child) — it's dehydrated once and the result is
  * reused under every declaring state name, matching how the engine already
  * treats shared children elsewhere (dispose, event subscriptions).
  *
  * Declaring names are grouped by `childLink.instance` (the actual FSM
  * instance, not the `ChildLink` wrapper — `wrapChildLinks()` mints a fresh
  * wrapper per declaring state, so grouping by wrapper would never hit for a
  * shared child) BEFORE any `onPath` is computed or any child is dehydrated.
  * A shared child's `onPath` is the OR of `stateName === activeState` across
  * every declaring name in its group: at most one declaring name can ever
  * equal `activeState`, so this combined flag is correct and, critically,
  * independent of `Object.keys(this.states)` iteration order — computing
  * `onPath` per-declaring-name and caching whichever one happened to run
  * first would silently launder an on-path client's Fsm-child throw through
  * an unrelated off-path declaring name.
  *
  * An off-path Fsm child (declared only at states other than `activeState`,
  * OR nested anywhere under a `BehavioralFsm` child that is itself off-path
  * relative to the true root) is skipped entirely rather than dehydrated:
  * Fsm state isn't tracked per-client to begin with, so an off-path Fsm
  * child has nothing to lose by being skipped — unlike a BehavioralFsm
  * child's off-path meta, which is real per-client data. `isOnActivePath`
  * is the inherited "am I even reachable from the root" flag; combining it
  * with the group's `stateNames.includes(activeState)` check (rather than
  * using that check alone) is what keeps a nested Fsm grandchild from
  * throwing when its immediate BehavioralFsm parent is itself off-path —
  * the parent's own dormant `activeState` is irrelevant once the parent
  * isn't reachable. This keeps one Fsm child anywhere in the hierarchy from
  * disabling `dehydrate()` for every client, only for clients actually on
  * that branch.
  */
  collectChildSnapshots(e, t, n) {
    const r = /* @__PURE__ */ new Map();
    for (const a of Object.keys(this.states)) {
      var s;
      const c = (s = this.states[a]) === null || s === void 0 ? void 0 : s._child;
      if (!c) continue;
      const d = r.get(c.instance);
      d ? d.stateNames.push(a) : r.set(c.instance, {
        childLink: c,
        stateNames: [a]
      });
    }
    let o;
    for (const a of r.values()) {
      const c = a.childLink, d = a.stateNames, l = n && d.includes(t);
      if (c.instance[Bn] === "Fsm" && !l) continue;
      const u = c.dehydrate(e, l);
      if (u) {
        o ?? (o = {});
        for (const h of d) o[h] = u;
      }
    }
    return o;
  }
  snapshotDeferredInput(e) {
    let t;
    try {
      t = Ap(e.args, "args");
    } catch (r) {
      if (!(r instanceof gn)) throw r;
      const s = e.untilState ? ' (until "'.concat(e.untilState, '")') : "";
      throw new Error('dehydrate: deferred input "'.concat(e.inputName, '"').concat(s, ' in FSM "').concat(this.id, '" has a non-serializable value at ').concat(r.path, " (").concat(r.label, ")"));
    }
    const n = {
      inputName: e.inputName,
      args: t
    };
    return e.untilState !== void 0 && (n.untilState = e.untilState), n;
  }
  on(e, t) {
    return this.disposed ? {
      off() {
      }
    } : this.emitter.on(e, t);
  }
  /**
  * Emit a custom event through the FSM. Built-in lifecycle events are
  * emitted automatically — this is for user-defined events from handlers.
  * No-ops when disposed.
  */
  emit(e, t) {
    this.disposed || this.emitter.emit(e, t);
  }
  /**
  * Permanently shut down this FSM. Irreversible — all subsequent method
  * calls become silent no-ops. Tears down child subscriptions, clears all
  * listeners, and cascades disposal to child FSMs (unless `preserveChildren`
  * is set). The same child appearing in multiple states is disposed once.
  */
  dispose(e) {
    this.disposed = !0;
    for (const n of this.childSubscriptions) n.off();
    if (!(e != null && e.preserveChildren)) {
      const n = /* @__PURE__ */ new Set();
      for (const r of Object.keys(this.states)) {
        var t;
        const s = (t = this.states[r]) === null || t === void 0 ? void 0 : t._child;
        s && !n.has(s.instance) && (n.add(s.instance), s.dispose());
      }
    }
    this.emitter.clear();
  }
  /**
  * Walks all states at construction time, detects raw FSM instances assigned
  * to _child, and wraps them into ChildLink adapters via createChildLink().
  * Must run BEFORE setupChildSubscriptions() so the subscriptions see
  * ChildLink objects, not raw FSM instances.
  */
  wrapChildLinks() {
    for (const e of Object.keys(this.states)) {
      const t = this.states[e], n = t?._child;
      if (n) {
        if (typeof n != "object") throw new Error('State "'.concat(e, '"._child: expected an Fsm or BehavioralFsm instance, got ').concat(String(n)));
        if (!(Bn in n)) throw new Error('State "'.concat(e, '"._child: expected an Fsm or BehavioralFsm instance, got a plain object'));
        t._child = Lp(n);
      }
    }
  }
  /**
  * Walks all states at construction time, finds states with _child, and
  * subscribes once to each unique child's wildcard events. Subscriptions are
  * stored for cleanup in dispose(). We deduplicate by `childLink.instance`
  * (the underlying Fsm/BehavioralFsm instance), not the `ChildLink` wrapper —
  * `wrapChildLinks()` mints a fresh wrapper per declaring state, so a child
  * shared across states would otherwise get one subscription PER declaring
  * state, each independently walking known clients and relaying events. That
  * silently double-fires client-less relays (Fsm-child events, or a
  * BehavioralFsm child's custom `emit()` with no `client` in the payload)
  * whenever two different clients are active on two different declaring
  * names at once — the same wrapper-vs-instance identity bug
  * `collectChildSnapshots()` had before its #184 fix.
  */
  setupChildSubscriptions() {
    const e = /* @__PURE__ */ new Set();
    for (const n of Object.keys(this.states)) {
      var t;
      const r = (t = this.states[n]) === null || t === void 0 ? void 0 : t._child;
      if (!r || e.has(r.instance)) continue;
      e.add(r.instance);
      const s = r.onAny((o, a) => {
        if (o === "nohandler") {
          var c;
          const u = a;
          if (u.client !== void 0) this.bubbleNohandler(u.client, r, u.inputName, (c = u.args) !== null && c !== void 0 ? c : []);
          else for (const h of this.knownClients) {
            var d;
            const f = h.deref();
            if (f === void 0) {
              this.knownClients.delete(h);
              continue;
            }
            this.bubbleNohandler(f, r, u.inputName, (d = u.args) !== null && d !== void 0 ? d : []);
          }
          return;
        }
        const l = a;
        if (l && typeof l == "object" && "client" in l)
          this.isChildActiveForClient(l.client, r) && this.emitter.emit(o, a);
        else for (const u of this.knownClients) {
          const h = u.deref();
          if (!h) {
            this.knownClients.delete(u);
            continue;
          }
          if (this.isChildActiveForClient(h, r)) {
            this.emitter.emit(o, a);
            break;
          }
        }
      });
      this.childSubscriptions.push(s);
    }
  }
  /**
  * Bubbles a child nohandler to the parent for the given client.
  * Only fires if the client is currently in a state that has this childLink.
  * Extracted from the lambda in setupChildSubscriptions to keep it readable.
  */
  bubbleNohandler(e, t, n, r) {
    if (!this.isChildActiveForClient(e, t)) return;
    const s = this.clients.get(e);
    s.currentActionArgs = r, this.handleLocally(e, n, r, s);
  }
  /**
  * Returns true if the given client is currently in a parent state whose
  * _child resolves to the same underlying instance as childLink. Returns
  * false if the client has no meta (never initialized) or is in a state
  * with a different (or no) child.
  *
  * Compares `.instance`, not the `ChildLink` wrapper itself — setupChildSubscriptions()
  * dedupes subscriptions by instance and keeps only ONE representative wrapper
  * per shared child, so the client's actual active declaring state may hold a
  * DIFFERENT wrapper for that same instance (wrapChildLinks() mints one per
  * declaring state). Comparing wrappers directly would only ever match the one
  * declaring state whose wrapper happened to be kept for the subscription,
  * silently breaking relay for every other declaring name of a shared child.
  */
  isChildActiveForClient(e, t) {
    var n;
    const r = this.clients.get(e);
    return r ? ((n = this.states[r.state]) === null || n === void 0 || (n = n._child) === null || n === void 0 ? void 0 : n.instance) === t.instance : !1;
  }
  /**
  * The inner handler dispatch — no delegation, no initialization side effects
  * beyond what getOrCreateClientMeta already did. Called by handle() after
  * the delegation check, and by the nohandler child listener for bubbling.
  */
  handleLocally(e, t, n, r) {
    var s;
    const o = this.states[r.state], a = (s = o?.[t]) !== null && s !== void 0 ? s : o?.["*"];
    if (!a) {
      this.emitter.emit("nohandler", {
        inputName: t,
        args: n,
        client: e
      }), r.currentActionArgs = void 0;
      return;
    }
    try {
      this.emitter.emit("handling", {
        inputName: t,
        client: e
      });
      const c = this.buildHandlerArgs(e, t, r);
      let d;
      typeof a == "string" ? d = a : typeof a == "function" && (d = a(c, ...n)), this.emitter.emit("handled", {
        inputName: t,
        client: e
      }), typeof d == "string" && this.transition(e, d);
    } finally {
      r.currentActionArgs = void 0;
    }
  }
  getOrCreateClientMeta(e) {
    let t = this.clients.get(e);
    return t || (t = {
      state: void 0,
      deferredQueue: []
    }, this.clients.set(e, t), this.knownClients.add(new WeakRef(e)), this.transition(e, this.initialState), t);
  }
  buildHandlerArgs(e, t, n) {
    return {
      ctx: e,
      inputName: t,
      defer: (r) => {
        if (!n.currentActionArgs) return;
        const s = {
          inputName: t,
          args: [...n.currentActionArgs],
          untilState: r?.until
        };
        n.deferredQueue.push(s), this.emitter.emit("deferred", {
          inputName: t,
          client: e
        });
      },
      emit: (r, s) => {
        this.emitter.emit(r, s);
      }
    };
  }
  processQueue(e, t) {
    const n = [], r = [];
    for (const s of t.deferredQueue) s.untilState === void 0 || s.untilState === t.state ? n.push(s) : r.push(s);
    t.deferredQueue = r;
    for (const s of n) this.handle(e, s.inputName, ...s.args);
  }
};
function Lp(i) {
  if (!i || typeof i != "object") throw new Error("createChildLink: expected an Fsm or BehavioralFsm instance, got ".concat(String(i)));
  const e = i[Bn];
  if (e === "BehavioralFsm") return {
    instance: i,
    canHandle(t, n) {
      return i.canHandle(t, n);
    },
    handle(t, n) {
      for (var r = arguments.length, s = new Array(r > 2 ? r - 2 : 0), o = 2; o < r; o++)
        s[o - 2] = arguments[o];
      i.handle(t, n, ...s);
    },
    reset(t) {
      i.transition(t, i.initialState);
    },
    onAny(t) {
      return i.on("*", t);
    },
    compositeState(t) {
      return i.compositeState(t);
    },
    rehydrate(t, n) {
      i.rehydrate(t, n);
    },
    dehydrate(t, n) {
      return i.dehydrate(t, n);
    },
    planRehydrate(t, n) {
      return i.planSnapshotWrites(t, n);
    },
    dispose() {
      i.dispose();
    }
  };
  if (e === "Fsm") return {
    instance: i,
    canHandle(t, n) {
      return i.canHandle(n);
    },
    handle(t, n) {
      for (var r = arguments.length, s = new Array(r > 2 ? r - 2 : 0), o = 2; o < r; o++)
        s[o - 2] = arguments[o];
      i.handle(n, ...s);
    },
    reset(t) {
      i.reset();
    },
    onAny(t) {
      return i.on("*", t);
    },
    compositeState(t) {
      return i.compositeState();
    },
    rehydrate(t, n) {
      throw new Error("rehydrate: cannot rehydrate an Fsm child. Fsm owns its own context; rehydrate is only valid for BehavioralFsm hierarchies.");
    },
    dehydrate(t, n) {
      throw new Error("dehydrate: cannot dehydrate an Fsm child. Fsm owns its own context; dehydrate is only valid for BehavioralFsm hierarchies.");
    },
    planRehydrate(t, n) {
      throw new Error("rehydrate: cannot rehydrate an Fsm child. Fsm owns its own context; rehydrate is only valid for BehavioralFsm hierarchies.");
    },
    dispose() {
      i.dispose();
    }
  };
  throw new Error("createChildLink: expected an Fsm or BehavioralFsm instance, got [MACHINA_TYPE] = ".concat(String(e ?? "undefined")));
}
var Dp = class {
  constructor(e) {
    var t;
    D(this, "id", void 0), D(this, "initialState", void 0), D(this, Bn, "Fsm"), D(this, "states", void 0), D(this, "bfsm", void 0), D(this, "context", void 0), D(this, "emitter", new hl()), D(this, "disposed", !1), this.id = e.id, this.initialState = e.initialState, this.context = (t = e.context) !== null && t !== void 0 ? t : {}, this.bfsm = new Op(e), this.states = e.states, this.bfsm.on("*", (n, r) => {
      if (r && typeof r == "object" && "client" in r) {
        r.client;
        const s = xu(r, Ip);
        this.emitter.emit(n, s);
      } else this.emitter.emit(n, r);
    }), this.bfsm.transition(this.context, e.initialState);
  }
  /**
  * Dispatch an input to the current state's handler.
  * If a `_child` FSM in the current state can handle it, delegation occurs
  * there first; unhandled inputs bubble up to the parent.
  * No-ops silently when disposed.
  */
  handle(e) {
    if (!this.disposed) {
      for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++)
        n[r - 1] = arguments[r];
      this.bfsm.handle(this.context, e, ...n);
    }
  }
  /**
  * Returns true if the current state has a handler for `inputName`
  * (or a catch-all `"*"` handler), or if the current state's `_child`
  * chain can handle it (checked recursively, matching `handle()`'s
  * delegation reach). Does not trigger initialization or any side
  * effects. Returns false when disposed.
  */
  canHandle(e) {
    return this.disposed ? !1 : this.bfsm.canHandle(this.context, e);
  }
  /**
  * Transition back to `initialState`, firing `_onEnter` and lifecycle
  * events as if entering it fresh. No-ops silently when disposed.
  */
  reset() {
    this.disposed || this.bfsm.reset(this.context);
  }
  /**
  * Returns the current state name. Always defined — Fsm eagerly
  * initializes into `initialState` during construction.
  */
  currentState() {
    return this.bfsm.currentState(this.context);
  }
  /**
  * Directly transition to `toState`, firing `_onExit`, `_onEnter`, and
  * lifecycle events. Same-state transitions are silently ignored.
  * No-ops when disposed.
  */
  transition(e) {
    this.disposed || this.bfsm.transition(this.context, e);
  }
  /**
  * Returns the current state as a dot-delimited path that includes
  * any active child FSM states (e.g. `"active.connecting.retrying"`).
  * Returns just the current state name when no child is active.
  */
  compositeState() {
    return this.bfsm.compositeState(this.context);
  }
  on(e, t) {
    return this.disposed ? {
      off() {
      }
    } : this.emitter.on(e, t);
  }
  /**
  * Emit a custom event through the FSM. Built-in lifecycle events are
  * emitted automatically — this is for user-defined events from handlers.
  * Routes through the BehavioralFsm so all relay paths are consistent.
  * No-ops when disposed.
  */
  emit(e, t) {
    this.disposed || this.bfsm.emit(e, t);
  }
  /**
  * Permanently shut down this FSM. Irreversible — all subsequent method
  * calls become silent no-ops. Clears all listeners and cascades disposal
  * to child FSMs (unless `preserveChildren` is set).
  */
  dispose(e) {
    this.disposed = !0, this.bfsm.dispose(e), this.emitter.clear();
  }
};
function Np(i) {
  return new Dp(i);
}
function fl(i, e) {
  return e.attemptId === i.attemptId;
}
const To = (i, e) => {
  let t = i.ctx;
  if (fl(t, e))
    return "connected";
}, Ir = (i) => {
  let e = i.ctx;
  return e.attemptId += 1, e.lastError = void 0, "connecting";
}, Ar = (i) => {
  let e = i.ctx;
  return e.attemptId += 1, e.lastError = void 0, "reconnecting";
}, An = (i, e) => {
  let t = i.ctx;
  return t.closeReason = e.reason, "disconnecting";
}, Up = {
  new: {
    connect: Ir,
    close: An
  },
  connecting: {
    connectComplete: To,
    // An initial connect has no session to fall back on, so failure is terminal.
    connectFailed: (i, e) => {
      let t = i.ctx;
      return t.lastError = e.error, "closed";
    },
    close: An
  },
  connected: {
    reconnect: Ar,
    transportFailed: (i, e) => {
      let t = i.ctx;
      if (fl(t, e))
        return t.lastError = e.reason, "offline";
    },
    close: An
  },
  offline: {
    connect: Ir,
    reconnect: Ar,
    close: An
  },
  reconnecting: {
    reconnectComplete: To,
    reconnectFailed: (i, e) => {
      let t = i.ctx;
      return t.lastError = e.error, e.recoverable ? "offline" : "closed";
    },
    close: An
  },
  // Owns the transport until the close handshake settles. Every path into this state is followed
  // by a `closeComplete`, so it cannot become a trap.
  disconnecting: {
    closeComplete: "closed"
  },
  // No transport, but the session may still be resumable: the engine resumes after an unexpected
  // close just as it does from `offline`.
  closed: {
    connect: Ir,
    reconnect: Ar
  }
};
function Fp() {
  let i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "new";
  return Np({
    id: "signal",
    initialState: i,
    context: {
      attemptId: 0
    },
    states: Up
  });
}
class Bp {
  get readyState() {
    return this.ws.readyState;
  }
  constructor(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var n, r;
    if (!((n = t.signal) === null || n === void 0) && n.aborted)
      throw new DOMException("This operation was aborted", "AbortError");
    this.url = e;
    const s = new WebSocket(e, (r = t.protocols) !== null && r !== void 0 ? r : []);
    s.binaryType = "arraybuffer", this.ws = s;
    let o, a;
    const c = function() {
      let d = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      s.readyState === WebSocket.CONNECTING && (o = d, a(M.websocket("Websocket closed before the connection opened")));
      const l = d.closeCode, u = d.reason;
      s.close(l, u === void 0 ? void 0 : jp(u));
    };
    this.opened = new Ee((d, l) => {
      a = l;
      const u = () => {
        l(M.websocket("Encountered websocket error during connection establishment"));
      }, h = (f) => {
        l(M.websocket("Websocket closed during connection establishment with code ".concat(f.code).concat(f.reason ? ": ".concat(f.reason) : "")));
      };
      s.onopen = () => {
        if (o) {
          c(o);
          return;
        }
        d({
          readable: new ReadableStream({
            start(f) {
              s.onmessage = (g) => {
                let p = g.data;
                s.readyState === WebSocket.OPEN && f.enqueue(p);
              }, s.onerror = (g) => f.error(M.websocket(vp(g, "websocket"))), s.onclose = (g) => {
                g.wasClean || g.code === 1e3 ? f.close() : f.error(M.websocket("WS closed unexpectedly with code ".concat(g.code)));
              };
            },
            cancel: c
          }),
          writable: new WritableStream({
            write(f) {
              s.send(f);
            },
            abort() {
              s.close();
            },
            close: c
          }),
          protocol: s.protocol,
          extensions: s.extensions
        }), s.removeEventListener("error", u), s.removeEventListener("close", h);
      }, s.addEventListener("error", u), s.addEventListener("close", h);
    }), this.closed = new Ee((d, l) => {
      const u = () => m(this, void 0, void 0, function* () {
        const h = new Ee((g) => {
          s.readyState !== WebSocket.CLOSED && s.addEventListener("close", (p) => {
            g(p);
          }, {
            once: !0
          });
        }), f = yield Ee.race([be(250), h]);
        f ? d(f) : l(M.websocket("Encountered unspecified websocket error without a timely close event"));
      });
      s.addEventListener("close", (h) => {
        let f = h.code, g = h.reason;
        d({
          closeCode: f,
          reason: g
        }), s.removeEventListener("error", u);
      }), s.addEventListener("error", u);
    }), t.signal && (t.signal.onabort = () => c()), this.close = c;
  }
}
const So = 123;
function jp(i) {
  const e = new TextEncoder();
  if (e.encode(i).length <= So)
    return i;
  let t = "", n = 0;
  for (const r of i) {
    if (n += e.encode(r).length, n > So)
      break;
    t += r;
  }
  return t;
}
const qp = ["syncState", "trickle", "offer", "answer", "simulate", "leave"];
function Vp(i) {
  return i instanceof M ? i.reason !== J.LeaveRequest && i.reason !== J.NotAllowed : !0;
}
function Wp(i) {
  const e = qp.indexOf(i.case) >= 0;
  return q.trace("request allowed to bypass queue:", {
    canPass: e,
    req: i
  }), e;
}
var we;
(function(i) {
  i[i.CONNECTING = 0] = "CONNECTING", i[i.CONNECTED = 1] = "CONNECTED", i[i.RECONNECTING = 2] = "RECONNECTING", i[i.DISCONNECTING = 3] = "DISCONNECTING", i[i.DISCONNECTED = 4] = "DISCONNECTED";
})(we || (we = {}));
function Hp(i) {
  switch (i) {
    case "connected":
      return we.CONNECTED;
    case "connecting":
      return we.CONNECTING;
    case "reconnecting":
      return we.RECONNECTING;
    case "disconnecting":
      return we.DISCONNECTING;
    default:
      return we.DISCONNECTED;
  }
}
const zp = 250, Kp = 5e3;
class ua {
  get currentState() {
    return Hp(this.lifecycleState);
  }
  get isDisconnected() {
    const e = this.currentState;
    return e === we.DISCONNECTING || e === we.DISCONNECTED;
  }
  /** Runtime lifecycle state, finer grained than the public {@link currentState} projection. */
  get lifecycleState() {
    return this.machine.currentState();
  }
  /** Id of the current connection attempt and of the transport it owns. */
  get attemptId() {
    return this.machine.context.attemptId;
  }
  /**
   * Applies a lifecycle input and reports whether it moved the machine
   */
  sendLifecycleInput(e) {
    const t = this.lifecycleState;
    return this.machine.handle(e.type, e), this.lifecycleState !== t;
  }
  /**
   * Waits out a close that is already in flight. Establishing a session while one is tearing down
   * would race it for the transport — the teardown can close the socket the new attempt just
   * opened.
   */
  settleInFlightClose() {
    return m(this, void 0, void 0, function* () {
      this.log.debug("waiting for an in-flight close to settle before establishing a session"), (yield this.closingLock.lock())();
    });
  }
  get isEstablishingConnection() {
    return this.lifecycleState === "connecting" || this.lifecycleState === "reconnecting";
  }
  getNextRequestId() {
    return this._requestId += 1, this._requestId;
  }
  constructor() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !1, t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var n;
    this.rtt = 0, this.log = q, this._requestId = 0, this.useV0SignalPath = !1, this.resetCallbacks = () => {
      this.onAnswer = void 0, this.onLeave = void 0, this.onLocalTrackPublished = void 0, this.onLocalTrackUnpublished = void 0, this.onNegotiateRequested = void 0, this.onOffer = void 0, this.onRemoteMuteChanged = void 0, this.onSubscribedQualityUpdate = void 0, this.onTokenRefresh = void 0, this.onTrickle = void 0, this.onClose = void 0, this.onMediaSectionsRequirement = void 0;
    }, this.loggerContextCb = t.loggerContextCb, this.log = pe((n = t.loggerName) !== null && n !== void 0 ? n : ne.Signal, () => this.logContext), this.useJSON = e, this.requestQueue = new Rp(), this.queuedRequests = [], this.closingLock = new fe(), this.connectionLock = new fe(), this.machine = Fp(), this.machine.on("transitioned", (r) => {
      let s = r.fromState, o = r.toState;
      this.log.debug("signal lifecycle: ".concat(s, " -> ").concat(o));
    }), this.machine.on("nohandler", (r) => {
      let s = r.inputName;
      this.log.debug("ignoring signal lifecycle input ".concat(s, " in state ").concat(this.lifecycleState));
    }), this.machine;
  }
  get logContext() {
    var e, t;
    return (t = (e = this.loggerContextCb) === null || e === void 0 ? void 0 : e.call(this)) !== null && t !== void 0 ? t : {};
  }
  join(e, t, n, r) {
    return m(this, arguments, void 0, function(s, o, a, c) {
      var d = this;
      let l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !1, u = arguments.length > 5 ? arguments[5] : void 0;
      return (function* () {
        if (d.lifecycleState === "disconnecting" && (yield d.settleInFlightClose()), !d.sendLifecycleInput({
          type: "connect"
        }))
          throw M.internal("cannot establish a signal session from '".concat(d.lifecycleState, "', close the current one first"));
        d.options = a;
        try {
          return yield d.connect(s, o, a, c, l, u);
        } catch (h) {
          throw d.sendLifecycleInput({
            type: "connectFailed",
            error: h
          }), h;
        }
      })();
    });
  }
  reconnect(e, t, n, r) {
    return m(this, void 0, void 0, function* () {
      if (!this.options) {
        this.log.warn("attempted to reconnect without signal options being set, ignoring");
        return;
      }
      if (this.lifecycleState === "disconnecting" && (yield this.settleInFlightClose()), !this.sendLifecycleInput({
        type: "reconnect"
      }))
        throw M.internal("cannot resume the signal session from '".concat(this.lifecycleState, "'"));
      this.clearPingInterval();
      try {
        return yield this.connect(e, t, Object.assign(Object.assign({}, this.options), {
          reconnect: !0,
          sid: n,
          reconnectReason: r
        }), void 0, this.useV0SignalPath);
      } catch (s) {
        throw this.sendLifecycleInput({
          type: "reconnectFailed",
          error: s,
          recoverable: Vp(s)
        }), s;
      }
    });
  }
  connect(e, t, n, r) {
    return m(this, arguments, void 0, function(s, o, a, c) {
      var d = this;
      let l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !1, u = arguments.length > 5 ? arguments[5] : void 0;
      return (function* () {
        const h = yield d.connectionLock.lock();
        let f, g;
        try {
          d.connectOptions = a, d.useV0SignalPath = l;
          const p = Zf(a.clientInfoCapabilities), y = l ? Gp(o, p, a) : yield Jp(o, p, a, u);
          f = fp(s, y, l).toString(), g = mp(f).toString();
        } catch (p) {
          throw h(), p;
        }
        if (c?.aborted)
          throw h(), d.log.debug("signal connect abandoned before opening a transport"), M.cancelled("Connection aborted");
        return new Promise((p, y) => m(d, void 0, void 0, function* () {
          var k, w, A, b, T;
          try {
            let S = !1;
            const I = (Y) => m(this, void 0, void 0, function* () {
              if (S)
                return;
              S = !0;
              const Me = Y instanceof Event ? Y.currentTarget : Y, Te = gp(Me, "Abort handler called");
              this.streamWriter && !this.isDisconnected ? this.sendLeave().then(() => this.close(!0, Te)).catch((ct) => {
                this.log.error(ct), this.close(!0, Te);
              }) : this.close(!0, Te), O(), y(Y instanceof M ? Y : M.cancelled(Te));
            });
            c?.addEventListener("abort", I);
            const O = () => {
              clearTimeout(U), c?.removeEventListener("abort", I);
            }, U = setTimeout(() => {
              I(M.timeout("room connection has timed out (signal)"));
            }, a.websocketTimeout), N = new URL(f);
            if (N.searchParams.has("access_token") && N.searchParams.set("access_token", "<redacted>"), this.ws) {
              const Y = performance.now();
              yield this.teardownTransport("replaced by a new connection attempt"), this.log.debug("closed previous ws connection in ".concat(performance.now() - Y, "ms"));
            }
            if (S) {
              this.log.debug("signal connect abandoned after tearing down the previous transport");
              return;
            }
            const F = this.attemptId;
            this.log.info("signal connecting to ".concat(N), {
              reconnect: a.reconnect,
              reconnectReason: a.reconnectReason
            }), this.ws = new Bp(f);
            let K = !1;
            this.ws.opened.catch(() => {
              K = !0;
            });
            try {
              this.ws.closed.then((le) => {
                this.isEstablishingConnection && !K && y(M.internal("Websocket got closed during a (re)connection attempt: ".concat(le.reason))), this.log.debug("websocket closed", {
                  reason: le.reason,
                  code: le.closeCode,
                  attemptId: F,
                  state: this.lifecycleState
                }), this.handleOnClose(le.reason || (le.closeCode === 1e3 ? "server closed the signal connection" : "Unexpected WS error"), F);
              }).catch((le) => {
                this.isEstablishingConnection && !K && y(M.internal("Websocket error during a (re)connection attempt: ".concat(le)));
              });
              const Y = yield this.ws.opened.catch((le) => m(this, void 0, void 0, function* () {
                if (S) {
                  this.log.debug("signal connect abandoned while the websocket was opening");
                  return;
                }
                if (this.lifecycleState !== "connected") {
                  clearTimeout(U);
                  const kt = yield this.handleConnectionError(le, g);
                  y(kt);
                  return;
                }
                this.handleWSError(le), y(le);
              }));
              if (clearTimeout(U), !Y)
                return;
              const Me = Y.readable.getReader();
              this.streamWriter = Y.writable.getWriter();
              let Te;
              try {
                const le = Date.now() + Kp;
                for (; ; ) {
                  const kt = le - Date.now();
                  if (kt <= 0)
                    throw M.timeout("signal connection timed out while waiting for the first message");
                  let Yt;
                  const Xt = yield Promise.race([Me.read(), new Promise((Ma, ci) => {
                    Yt = setTimeout(() => {
                      ci(M.timeout("signal connection timed out while waiting for the first message"));
                    }, kt);
                  })]);
                  if (clearTimeout(Yt), !Xt.value)
                    throw M.internal("no message received as first message");
                  const Tt = yo(Xt.value);
                  if (this.lifecycleState === "reconnecting" && ((k = Tt.message) === null || k === void 0 ? void 0 : k.case) !== "reconnect" && ((w = Tt.message) === null || w === void 0 ? void 0 : w.case) !== "leave") {
                    this.log.warn("dropping signal message while awaiting reconnect response", {
                      messageCase: (A = Tt.message) === null || A === void 0 ? void 0 : A.case
                    });
                    continue;
                  }
                  Te = Tt;
                  break;
                }
              } catch (le) {
                Me.releaseLock(), y(le), this.close();
                return;
              }
              if (Me.releaseLock(), S) {
                this.log.debug("signal connect abandoned while waiting for the first message");
                return;
              }
              const ct = this.validateFirstMessage(Te, (b = a.reconnect) !== null && b !== void 0 ? b : !1);
              if (!ct.isValid) {
                y(ct.error);
                return;
              }
              ((T = Te.message) === null || T === void 0 ? void 0 : T.case) === "join" && (this.pingTimeoutDuration = Te.message.value.pingTimeout, this.pingIntervalDuration = Te.message.value.pingInterval, this.pingTimeoutDuration && this.pingTimeoutDuration > 0 && this.log.debug("ping config", {
                timeout: this.pingTimeoutDuration,
                interval: this.pingIntervalDuration
              }), this.onJoined && this.onJoined(Te.message.value)), this.handleSignalConnected(Y, U, F), p(ct.response);
            } catch (Y) {
              y(Y);
            } finally {
              O();
            }
          } finally {
            h();
          }
        }));
      })();
    });
  }
  startReadingLoop(e) {
    return m(this, void 0, void 0, function* () {
      const t = this.attemptId;
      for (; ; ) {
        this.signalLatency && (yield be(this.signalLatency));
        try {
          const n = yield e.read(), r = n.done, s = n.value;
          if (r)
            break;
          const o = yo(s);
          this.handleSignalResponse(o);
        } catch (n) {
          yield this.handleOnClose("error in reading loop", t, void 0, n);
          break;
        }
      }
    });
  }
  close() {
    return m(this, arguments, void 0, function() {
      var e = this;
      let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "Close method called on signal client";
      return (function* () {
        const r = t && e.sendLifecycleInput({
          type: "close",
          reason: n
        }), s = yield e.closingLock.lock();
        try {
          yield e.teardownTransport(n);
        } finally {
          r && e.sendLifecycleInput({
            type: "closeComplete"
          }), s();
        }
      })();
    });
  }
  /**
   * Releases the transport and everything tied to it, without touching the lifecycle state. Used
   * both by {@link close} and by paths that replace the transport under a live lifecycle (a new
   * attempt, or an unexpected close that leaves the client in `offline`).
   */
  teardownTransport(e) {
    return m(this, void 0, void 0, function* () {
      try {
        this.clearPingInterval();
        const t = this.ws;
        t && (this.ws = void 0, this.streamWriter = void 0, t.close({
          closeCode: 1e3,
          reason: e
        }), yield Promise.race([t.closed, be(zp)]));
      } catch (t) {
        this.log.debug("websocket error while closing", {
          error: t
        });
      }
    });
  }
  // initial offer after joining
  sendOffer(e, t) {
    this.log.debug("sending offer", {
      offerSdp: e.sdp
    }), this.sendRequest({
      case: "offer",
      value: Ft(e, t)
    });
  }
  // answer a server-initiated offer
  sendAnswer(e, t) {
    return this.log.debug("sending answer", {
      answerSdp: e.sdp
    }), this.sendRequest({
      case: "answer",
      value: Ft(e, t)
    });
  }
  sendIceCandidate(e, t) {
    return this.log.debug("sending ice candidate", {
      candidate: e
    }), this.sendRequest({
      case: "trickle",
      value: new Xi({
        candidateInit: JSON.stringify(e),
        target: t
      })
    });
  }
  sendMuteTrack(e, t) {
    return this.sendRequest({
      case: "mute",
      value: new Zi({
        sid: e,
        muted: t
      })
    });
  }
  sendAddTrack(e) {
    return this.sendRequest({
      case: "addTrack",
      value: e
    });
  }
  sendUpdateLocalMetadata(e, t) {
    return m(this, arguments, void 0, function(n, r) {
      var s = this;
      let o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return (function* () {
        const a = s.getNextRequestId();
        return yield s.sendRequest({
          case: "updateMetadata",
          value: new ta({
            requestId: a,
            metadata: n,
            name: r,
            attributes: o
          })
        }), a;
      })();
    });
  }
  sendUpdateTrackSettings(e) {
    this.sendRequest({
      case: "trackSetting",
      value: e
    });
  }
  sendUpdateSubscription(e) {
    return this.sendRequest({
      case: "subscription",
      value: e
    });
  }
  sendSyncState(e) {
    return this.sendRequest({
      case: "syncState",
      value: e
    });
  }
  sendUpdateVideoLayers(e, t) {
    return this.sendRequest({
      case: "updateLayers",
      value: new Bd({
        trackSid: e,
        layers: t
      })
    });
  }
  sendUpdateSubscriptionPermissions(e, t) {
    return this.sendRequest({
      case: "subscriptionPermission",
      value: new Vd({
        allParticipants: e,
        trackPermissions: t
      })
    });
  }
  sendSimulateScenario(e) {
    return this.sendRequest({
      case: "simulate",
      value: e
    });
  }
  sendPing() {
    return Promise.all([this.sendRequest({
      case: "ping",
      value: te.parse(Date.now())
    }), this.sendRequest({
      case: "pingReq",
      value: new zd({
        timestamp: te.parse(Date.now()),
        rtt: te.parse(this.rtt)
      })
    })]);
  }
  sendUpdateLocalAudioTrack(e, t) {
    return this.sendRequest({
      case: "updateAudioTrack",
      value: new ea({
        trackSid: e,
        features: t
      })
    });
  }
  sendLeave() {
    return this.sendRequest({
      case: "leave",
      value: new tr({
        reason: Le.CLIENT_INITIATED,
        // server doesn't process this field, keeping it here to indicate the intent of a full disconnect
        action: cn.DISCONNECT
      })
    });
  }
  sendPublishDataTrackRequest(e, t, n) {
    return this.sendRequest({
      case: "publishDataTrackRequest",
      value: new $s({
        pubHandle: e,
        name: t,
        encryption: n ? H.GCM : H.NONE
      })
    });
  }
  sendUnPublishDataTrackRequest(e) {
    return this.sendRequest({
      case: "unpublishDataTrackRequest",
      value: new Ys({
        pubHandle: e
      })
    });
  }
  sendUpdateDataSubscription(e, t) {
    return this.sendRequest({
      case: "updateDataSubscription",
      value: new Zs({
        // FIXME: consider refactoring to allow caller to pass an array of events through
        updates: [new Nd({
          trackSid: e,
          subscribe: t
        })]
      })
    });
  }
  sendRequest(e) {
    return m(this, arguments, void 0, function(t) {
      var n = this;
      let r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      return (function* () {
        const s = !r && !Wp(t), o = n.lifecycleState === "reconnecting" || n.queuedRequests.length > 0;
        if (s && o) {
          n.queuedRequests.push(() => m(n, void 0, void 0, function* () {
            yield this.sendRequest(t, !0);
          }));
          return;
        }
        r || (yield n.requestQueue.flush()), n.signalLatency && (yield be(n.signalLatency));
        const a = t.case === "leave" && !!n.streamWriter;
        if (n.isDisconnected && !a) {
          n.log.debug("skipping signal request (type: ".concat(t.case, ") - SignalClient disconnected"));
          return;
        }
        if (!n.streamWriter) {
          n.log.error("cannot send signal request before connected, type: ".concat(t?.case));
          return;
        }
        const c = new xh({
          message: t
        });
        try {
          n.useJSON ? yield n.streamWriter.write(c.toJsonString()) : yield n.streamWriter.write(c.toBinary().buffer);
        } catch (d) {
          n.log.error("error sending signal message", {
            error: d
          });
        }
      })();
    });
  }
  handleSignalResponse(e) {
    var t, n;
    const r = e.message;
    if (r == null) {
      this.log.debug("received unsupported message");
      return;
    }
    let s = !1;
    if (r.case === "answer") {
      const o = Co(r.value);
      this.onAnswer && this.onAnswer(o, r.value.id, r.value.midToTrackId);
    } else if (r.case === "offer") {
      const o = Co(r.value);
      this.onOffer && this.onOffer(o, r.value.id, r.value.midToTrackId);
    } else if (r.case === "trickle") {
      const o = JSON.parse(r.value.candidateInit);
      this.onTrickle && this.onTrickle(o, r.value.target);
    } else r.case === "update" ? this.onParticipantUpdate && this.onParticipantUpdate((t = r.value.participants) !== null && t !== void 0 ? t : []) : r.case === "trackPublished" ? this.onLocalTrackPublished && this.onLocalTrackPublished(r.value) : r.case === "speakersChanged" ? this.onSpeakersChanged && this.onSpeakersChanged((n = r.value.speakers) !== null && n !== void 0 ? n : []) : r.case === "leave" ? this.onLeave && this.onLeave(r.value) : r.case === "mute" ? this.onRemoteMuteChanged && this.onRemoteMuteChanged(r.value.sid, r.value.muted) : r.case === "roomUpdate" ? this.onRoomUpdate && r.value.room && this.onRoomUpdate(r.value.room) : r.case === "connectionQuality" ? this.onConnectionQuality && this.onConnectionQuality(r.value) : r.case === "streamStateUpdate" ? this.onStreamStateUpdate && this.onStreamStateUpdate(r.value) : r.case === "subscribedQualityUpdate" ? this.onSubscribedQualityUpdate && this.onSubscribedQualityUpdate(r.value) : r.case === "subscriptionPermissionUpdate" ? this.onSubscriptionPermissionUpdate && this.onSubscriptionPermissionUpdate(r.value) : r.case === "refreshToken" ? this.onTokenRefresh && this.onTokenRefresh(r.value) : r.case === "trackUnpublished" ? this.onLocalTrackUnpublished && this.onLocalTrackUnpublished(r.value) : r.case === "subscriptionResponse" ? this.onSubscriptionError && this.onSubscriptionError(r.value) : r.case === "pong" || (r.case === "pongResp" ? (this.rtt = Date.now() - Number.parseInt(r.value.lastPingTimestamp.toString()), this.resetPingTimeout(), s = !0) : r.case === "requestResponse" ? this.onRequestResponse && this.onRequestResponse(r.value) : r.case === "trackSubscribed" ? this.onLocalTrackSubscribed && this.onLocalTrackSubscribed(r.value.trackSid) : r.case === "roomMoved" ? (this.onTokenRefresh && this.onTokenRefresh(r.value.token), this.onRoomMoved && this.onRoomMoved(r.value)) : r.case === "mediaSectionsRequirement" ? this.onMediaSectionsRequirement && this.onMediaSectionsRequirement(r.value) : r.case === "publishDataTrackResponse" ? this.onPublishDataTrackResponse && this.onPublishDataTrackResponse(r.value) : r.case === "unpublishDataTrackResponse" ? this.onUnPublishDataTrackResponse && this.onUnPublishDataTrackResponse(r.value) : r.case === "dataTrackSubscriberHandles" ? this.onDataTrackSubscriberHandles && this.onDataTrackSubscriberHandles(r.value) : this.log.debug("unsupported message", {
      msgCase: r.case
    }));
    s || this.resetPingTimeout();
  }
  setReconnected() {
    for (; this.queuedRequests.length > 0; ) {
      const e = this.queuedRequests.shift();
      e && this.requestQueue.run(e);
    }
  }
  /**
   * Handles a transport we lost without asking to. The client goes to `offline` rather than
   * `closed`: whether this session gets resumed, restarted or given up on is the engine's call.
   */
  handleOnClose(e) {
    return m(this, arguments, void 0, function(t) {
      var n = this;
      let r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : this.attemptId, s = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0;
      return (function* () {
        const a = n.onClose;
        if (!n.sendLifecycleInput({
          type: "transportFailed",
          attemptId: r,
          reason: t
        })) {
          n.log.debug("ignoring transport close in state ".concat(n.lifecycleState), Object.assign({
            reason: t,
            attemptId: r,
            currentAttemptId: n.attemptId
          }, o !== void 0 ? {
            error: o
          } : {}));
          return;
        }
        o !== void 0 && n.log.error("error reading from signal stream", {
          error: o
        }), yield n.teardownTransport(t), n.log.info("websocket connection closed: ".concat(t), {
          reason: t
        }), s && (n.log.info("waiting for ".concat(s, "ms until reconnecting signal")), yield be(s)), a && a(t);
      })();
    });
  }
  handleWSError(e) {
    this.log.error("websocket error", {
      error: e
    });
  }
  /**
   * Resets the ping timeout and starts a new timeout.
   * Call this after receiving a pong message
   */
  resetPingTimeout() {
    if (this.clearPingTimeout(), !this.isDisconnected) {
      if (!this.pingTimeoutDuration) {
        this.log.warn("ping timeout duration not set");
        return;
      }
      this.pingTimeout = z.setTimeout(() => {
        this.log.warn("ping timeout triggered. last pong received at: ".concat(new Date(Date.now() - this.pingTimeoutDuration * 1e3).toUTCString())), this.handleOnClose("ping timeout");
      }, this.pingTimeoutDuration * 1e3);
    }
  }
  /**
   * Clears ping timeout (does not start a new timeout)
   */
  clearPingTimeout() {
    this.pingTimeout && z.clearTimeout(this.pingTimeout);
  }
  startPingInterval() {
    if (this.clearPingInterval(), this.resetPingTimeout(), !this.pingIntervalDuration) {
      this.log.warn("ping interval duration not set");
      return;
    }
    this.log.debug("start ping interval"), this.pingInterval = z.setInterval(() => {
      this.sendPing();
    }, this.pingIntervalDuration * 1e3);
  }
  clearPingInterval() {
    this.log.debug("clearing ping interval"), this.clearPingTimeout(), this.pingInterval && z.clearInterval(this.pingInterval);
  }
  /**
   * Handles the successful connection to the signal server
   * @param connection The WebSocket connection
   * @param timeoutHandle The timeout handle to clear
   * @param firstMessage Optional first message to process
   * @internal
   */
  handleSignalConnected(e, t, n) {
    if (clearTimeout(t), !this.sendLifecycleInput(this.lifecycleState === "reconnecting" ? {
      type: "reconnectComplete",
      attemptId: n
    } : {
      type: "connectComplete",
      attemptId: n
    })) {
      this.log.debug("discarding a connection whose attempt no longer owns the session", {
        attemptId: n,
        currentAttemptId: this.attemptId,
        state: this.lifecycleState
      });
      return;
    }
    this.log.info("signal connected"), this.startPingInterval(), this.startReadingLoop(e.readable.getReader());
  }
  /**
   * Validates the first message received from the signal server
   * @param firstSignalResponse The first signal response received
   * @param isReconnect Whether this is a reconnection attempt
   * @returns Validation result with response or error
   * @internal
   */
  validateFirstMessage(e, t) {
    var n, r, s, o;
    return ((n = e.message) === null || n === void 0 ? void 0 : n.case) === "join" ? {
      isValid: !0,
      response: e.message.value
    } : this.lifecycleState === "reconnecting" && ((r = e.message) === null || r === void 0 ? void 0 : r.case) === "reconnect" ? {
      isValid: !0,
      response: e.message.value
    } : this.isEstablishingConnection && ((s = e.message) === null || s === void 0 ? void 0 : s.case) === "leave" ? {
      isValid: !1,
      error: M.leaveRequest("Received leave request while trying to (re)connect", e.message.value.reason)
    } : t ? {
      isValid: !1,
      error: M.internal("Unexpected first message")
    } : {
      isValid: !1,
      error: M.internal("did not receive join response, got ".concat((o = e.message) === null || o === void 0 ? void 0 : o.case, " instead"))
    };
  }
  /**
   * Handles WebSocket connection errors by validating with the server
   * @param reason The error that occurred
   * @param validateUrl The URL to validate the connection with
   * @returns A ConnectionError with appropriate reason and status
   * @internal
   */
  handleConnectionError(e, t) {
    return m(this, void 0, void 0, function* () {
      try {
        const n = yield fetch(t, {
          signal: la(3e3)
        });
        switch (n.status) {
          case 404:
            const r = yield n.text();
            return r.includes("requested room does not exist") ? M.notAllowed(r, n.status) : M.serviceNotFound("v1 RTC path not found. Consider upgrading your LiveKit server version", "v0-rtc");
          case 401:
          case 403:
            const s = yield n.text();
            return M.notAllowed(s, n.status);
          default:
            break;
        }
        return e instanceof M ? e : M.internal("Encountered unknown websocket error during connection: ".concat(e), {
          status: n.status,
          statusText: n.statusText
        });
      } catch (n) {
        return n instanceof M ? n : M.serverUnreachable(n instanceof Error ? n.message : "server was not reachable");
      }
    });
  }
}
function Co(i) {
  const e = {
    type: "offer",
    sdp: i.sdp
  };
  switch (i.type) {
    case "answer":
    case "offer":
    case "pranswer":
    case "rollback":
      e.type = i.type;
      break;
  }
  return e;
}
function Ft(i, e) {
  return new Ot({
    sdp: i.sdp,
    type: i.type,
    id: e
  });
}
function Gp(i, e, t) {
  var n;
  const r = new URLSearchParams();
  return r.set("access_token", i), t.reconnect && (r.set("reconnect", "1"), t.sid && r.set("sid", t.sid)), r.set("auto_subscribe", t.autoSubscribe ? "1" : "0"), r.set("sdk", qe() ? "reactnative" : "js"), r.set("version", e.version), r.set("protocol", e.protocol.toString()), r.set("client_protocol", e.clientProtocol.toString()), e.deviceModel && r.set("device_model", e.deviceModel), e.os && r.set("os", e.os), e.osVersion && r.set("os_version", e.osVersion), e.browser && r.set("browser", e.browser), e.browserVersion && r.set("browser_version", e.browserVersion), t.adaptiveStream && r.set("adaptive_stream", "1"), t.disableIceLite && r.set("disable_ice_lite", "1"), typeof t.subscriberAllowPause < "u" && r.set("subscriber_allow_pause", t.subscriberAllowPause ? "1" : "0"), t.reconnectReason && r.set("reconnect_reason", t.reconnectReason.toString()), !((n = navigator.connection) === null || n === void 0) && n.type && r.set("network", navigator.connection.type), r;
}
function Jp(i, e, t, n) {
  return m(this, void 0, void 0, function* () {
    const r = new URLSearchParams();
    r.set("access_token", i);
    const s = new of({
      clientInfo: e,
      connectionSettings: new Kd({
        autoSubscribe: !!t.autoSubscribe,
        adaptiveStream: !!t.adaptiveStream,
        disableIceLite: !!t.disableIceLite,
        subscriberAllowPause: t.subscriberAllowPause
      }),
      reconnect: !!t.reconnect,
      participantSid: t.sid ? t.sid : void 0,
      publisherOffer: n
    });
    t.reconnectReason && (s.reconnectReason = t.reconnectReason);
    const o = s.toBinary();
    let a, c;
    if (dl()) {
      const h = new CompressionStream("gzip"), f = h.writable.getWriter();
      f.write(new Uint8Array(o)), f.close();
      const g = [], p = h.readable.getReader();
      for (; ; ) {
        const A = yield p.read(), b = A.done, T = A.value;
        if (b) break;
        g.push(T);
      }
      const y = g.reduce((A, b) => A + b.length, 0), k = new Uint8Array(y);
      let w = 0;
      for (const A of g)
        k.set(A, w), w += A.length;
      a = k, c = as.GZIP;
    } else
      a = o, c = as.NONE;
    const l = new cf({
      joinRequest: a,
      compression: c
    }).toBinary(), u = (h) => {
      const f = Array.from(h, (g) => String.fromCodePoint(g)).join("");
      return btoa(f);
    };
    return r.set("join_request", u(l).replace(/\+/g, "-").replace(/\//g, "_")), r;
  });
}
class $p {
  /**
   * @param ttl ttl of the key (ms)
   */
  constructor(e) {
    this._map = /* @__PURE__ */ new Map(), this._lastCleanup = 0, this.ttl = e;
  }
  set(e, t) {
    const n = Date.now();
    n - this._lastCleanup > this.ttl / 2 && this.cleanup();
    const r = n + this.ttl;
    return this._map.set(e, {
      value: t,
      expiresAt: r
    }), this;
  }
  get(e) {
    const t = this._map.get(e);
    if (t) {
      if (t.expiresAt < Date.now()) {
        this._map.delete(e);
        return;
      }
      return t.value;
    }
  }
  has(e) {
    const t = this._map.get(e);
    return t ? t.expiresAt < Date.now() ? (this._map.delete(e), !1) : !0 : !1;
  }
  delete(e) {
    return this._map.delete(e);
  }
  clear() {
    this._map.clear();
  }
  cleanup() {
    const e = Date.now();
    for (const n of this._map.entries()) {
      var t = L(n, 2);
      const r = t[0];
      t[1].expiresAt < e && this._map.delete(r);
    }
    this._lastCleanup = e;
  }
  get size() {
    return this.cleanup(), this._map.size;
  }
  forEach(e) {
    this.cleanup();
    for (const n of this._map.entries()) {
      var t = L(n, 2);
      const r = t[0], s = t[1];
      s.expiresAt >= Date.now() && e(s.value, r, this.asValueMap());
    }
  }
  map(e) {
    this.cleanup();
    const t = [], n = this.asValueMap();
    for (const s of n.entries()) {
      var r = L(s, 2);
      const o = r[0], a = r[1];
      t.push(e(a, o, n));
    }
    return t;
  }
  asValueMap() {
    const e = /* @__PURE__ */ new Map();
    for (const n of this._map.entries()) {
      var t = L(n, 2);
      const r = t[0], s = t[1];
      s.expiresAt >= Date.now() && e.set(r, s.value);
    }
    return e;
  }
}
var We = {}, xr = {}, Mr = { exports: {} }, wo;
function ha() {
  if (wo) return Mr.exports;
  wo = 1;
  var i = Mr.exports = {
    v: [{
      name: "version",
      reg: /^(\d*)$/
    }],
    o: [{
      // o=- 20518 0 IN IP4 203.0.113.1
      // NB: sessionId will be a String in most cases because it is huge
      name: "origin",
      reg: /^(\S*) (\d*) (\d*) (\S*) IP(\d) (\S*)/,
      names: ["username", "sessionId", "sessionVersion", "netType", "ipVer", "address"],
      format: "%s %s %d %s IP%d %s"
    }],
    // default parsing of these only (though some of these feel outdated)
    s: [{
      name: "name"
    }],
    i: [{
      name: "description"
    }],
    u: [{
      name: "uri"
    }],
    e: [{
      name: "email"
    }],
    p: [{
      name: "phone"
    }],
    z: [{
      name: "timezones"
    }],
    // TODO: this one can actually be parsed properly...
    r: [{
      name: "repeats"
    }],
    // TODO: this one can also be parsed properly
    // k: [{}], // outdated thing ignored
    t: [{
      // t=0 0
      name: "timing",
      reg: /^(\d*) (\d*)/,
      names: ["start", "stop"],
      format: "%d %d"
    }],
    c: [{
      // c=IN IP4 10.47.197.26
      name: "connection",
      reg: /^IN IP(\d) (\S*)/,
      names: ["version", "ip"],
      format: "IN IP%d %s"
    }],
    b: [{
      // b=AS:4000
      push: "bandwidth",
      reg: /^(TIAS|AS|CT|RR|RS):(\d*)/,
      names: ["type", "limit"],
      format: "%s:%s"
    }],
    m: [{
      // m=video 51744 RTP/AVP 126 97 98 34 31
      // NB: special - pushes to session
      // TODO: rtp/fmtp should be filtered by the payloads found here?
      reg: /^(\w*) (\d*) ([\w/]*)(?: (.*))?/,
      names: ["type", "port", "protocol", "payloads"],
      format: "%s %d %s %s"
    }],
    a: [
      {
        // a=rtpmap:110 opus/48000/2
        push: "rtp",
        reg: /^rtpmap:(\d*) ([\w\-.]*)(?:\s*\/(\d*)(?:\s*\/(\S*))?)?/,
        names: ["payload", "codec", "rate", "encoding"],
        format: function(e) {
          return e.encoding ? "rtpmap:%d %s/%s/%s" : e.rate ? "rtpmap:%d %s/%s" : "rtpmap:%d %s";
        }
      },
      {
        // a=fmtp:108 profile-level-id=24;object=23;bitrate=64000
        // a=fmtp:111 minptime=10; useinbandfec=1
        push: "fmtp",
        reg: /^fmtp:(\d*) ([\S| ]*)/,
        names: ["payload", "config"],
        format: "fmtp:%d %s"
      },
      {
        // a=control:streamid=0
        name: "control",
        reg: /^control:(.*)/,
        format: "control:%s"
      },
      {
        // a=rtcp:65179 IN IP4 193.84.77.194
        name: "rtcp",
        reg: /^rtcp:(\d*)(?: (\S*) IP(\d) (\S*))?/,
        names: ["port", "netType", "ipVer", "address"],
        format: function(e) {
          return e.address != null ? "rtcp:%d %s IP%d %s" : "rtcp:%d";
        }
      },
      {
        // a=rtcp-fb:98 trr-int 100
        push: "rtcpFbTrrInt",
        reg: /^rtcp-fb:(\*|\d*) trr-int (\d*)/,
        names: ["payload", "value"],
        format: "rtcp-fb:%s trr-int %d"
      },
      {
        // a=rtcp-fb:98 nack rpsi
        push: "rtcpFb",
        reg: /^rtcp-fb:(\*|\d*) ([\w-_]*)(?: ([\w-_]*))?/,
        names: ["payload", "type", "subtype"],
        format: function(e) {
          return e.subtype != null ? "rtcp-fb:%s %s %s" : "rtcp-fb:%s %s";
        }
      },
      {
        // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
        // a=extmap:1/recvonly URI-gps-string
        // a=extmap:3 urn:ietf:params:rtp-hdrext:encrypt urn:ietf:params:rtp-hdrext:smpte-tc 25@600/24
        push: "ext",
        reg: /^extmap:(\d+)(?:\/(\w+))?(?: (urn:ietf:params:rtp-hdrext:encrypt))? (\S*)(?: (\S*))?/,
        names: ["value", "direction", "encrypt-uri", "uri", "config"],
        format: function(e) {
          return "extmap:%d" + (e.direction ? "/%s" : "%v") + (e["encrypt-uri"] ? " %s" : "%v") + " %s" + (e.config ? " %s" : "");
        }
      },
      {
        // a=extmap-allow-mixed
        name: "extmapAllowMixed",
        reg: /^(extmap-allow-mixed)/
      },
      {
        // a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:PS1uQCVeeCFCanVmcjkpPywjNWhcYD0mXXtxaVBR|2^20|1:32
        push: "crypto",
        reg: /^crypto:(\d*) ([\w_]*) (\S*)(?: (\S*))?/,
        names: ["id", "suite", "config", "sessionConfig"],
        format: function(e) {
          return e.sessionConfig != null ? "crypto:%d %s %s %s" : "crypto:%d %s %s";
        }
      },
      {
        // a=setup:actpass
        name: "setup",
        reg: /^setup:(\w*)/,
        format: "setup:%s"
      },
      {
        // a=connection:new
        name: "connectionType",
        reg: /^connection:(new|existing)/,
        format: "connection:%s"
      },
      {
        // a=mid:1
        name: "mid",
        reg: /^mid:([^\s]*)/,
        format: "mid:%s"
      },
      {
        // a=msid:0c8b064d-d807-43b4-b434-f92a889d8587 98178685-d409-46e0-8e16-7ef0db0db64a
        name: "msid",
        reg: /^msid:(.*)/,
        format: "msid:%s"
      },
      {
        // a=ptime:20
        name: "ptime",
        reg: /^ptime:(\d*(?:\.\d*)*)/,
        format: "ptime:%d"
      },
      {
        // a=maxptime:60
        name: "maxptime",
        reg: /^maxptime:(\d*(?:\.\d*)*)/,
        format: "maxptime:%d"
      },
      {
        // a=sendrecv
        name: "direction",
        reg: /^(sendrecv|recvonly|sendonly|inactive)/
      },
      {
        // a=ice-lite
        name: "icelite",
        reg: /^(ice-lite)/
      },
      {
        // a=ice-ufrag:F7gI
        name: "iceUfrag",
        reg: /^ice-ufrag:(\S*)/,
        format: "ice-ufrag:%s"
      },
      {
        // a=ice-pwd:x9cml/YzichV2+XlhiMu8g
        name: "icePwd",
        reg: /^ice-pwd:(\S*)/,
        format: "ice-pwd:%s"
      },
      {
        // a=fingerprint:SHA-1 00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33
        name: "fingerprint",
        reg: /^fingerprint:(\S*) (\S*)/,
        names: ["type", "hash"],
        format: "fingerprint:%s %s"
      },
      {
        // a=candidate:0 1 UDP 2113667327 203.0.113.1 54400 typ host
        // a=candidate:1162875081 1 udp 2113937151 192.168.34.75 60017 typ host generation 0 network-id 3 network-cost 10
        // a=candidate:3289912957 2 udp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 generation 0 network-id 3 network-cost 10
        // a=candidate:229815620 1 tcp 1518280447 192.168.150.19 60017 typ host tcptype active generation 0 network-id 3 network-cost 10
        // a=candidate:3289912957 2 tcp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 tcptype passive generation 0 network-id 3 network-cost 10
        push: "candidates",
        reg: /^candidate:(\S*) (\d*) (\S*) (\d*) (\S*) (\d*) typ (\S*)(?: raddr (\S*) rport (\d*))?(?: tcptype (\S*))?(?: generation (\d*))?(?: network-id (\d*))?(?: network-cost (\d*))?/,
        names: ["foundation", "component", "transport", "priority", "ip", "port", "type", "raddr", "rport", "tcptype", "generation", "network-id", "network-cost"],
        format: function(e) {
          var t = "candidate:%s %d %s %d %s %d typ %s";
          return t += e.raddr != null ? " raddr %s rport %d" : "%v%v", t += e.tcptype != null ? " tcptype %s" : "%v", e.generation != null && (t += " generation %d"), t += e["network-id"] != null ? " network-id %d" : "%v", t += e["network-cost"] != null ? " network-cost %d" : "%v", t;
        }
      },
      {
        // a=end-of-candidates (keep after the candidates line for readability)
        name: "endOfCandidates",
        reg: /^(end-of-candidates)/
      },
      {
        // a=remote-candidates:1 203.0.113.1 54400 2 203.0.113.1 54401 ...
        name: "remoteCandidates",
        reg: /^remote-candidates:(.*)/,
        format: "remote-candidates:%s"
      },
      {
        // a=ice-options:google-ice
        name: "iceOptions",
        reg: /^ice-options:(\S*)/,
        format: "ice-options:%s"
      },
      {
        // a=ssrc:2566107569 cname:t9YU8M1UxTF8Y1A1
        push: "ssrcs",
        reg: /^ssrc:(\d*) ([\w_-]*)(?::(.*))?/,
        names: ["id", "attribute", "value"],
        format: function(e) {
          var t = "ssrc:%d";
          return e.attribute != null && (t += " %s", e.value != null && (t += ":%s")), t;
        }
      },
      {
        // a=ssrc-group:FEC 1 2
        // a=ssrc-group:FEC-FR 3004364195 1080772241
        push: "ssrcGroups",
        // token-char = %x21 / %x23-27 / %x2A-2B / %x2D-2E / %x30-39 / %x41-5A / %x5E-7E
        reg: /^ssrc-group:([\x21\x23\x24\x25\x26\x27\x2A\x2B\x2D\x2E\w]*) (.*)/,
        names: ["semantics", "ssrcs"],
        format: "ssrc-group:%s %s"
      },
      {
        // a=msid-semantic: WMS Jvlam5X3SX1OP6pn20zWogvaKJz5Hjf9OnlV
        name: "msidSemantic",
        reg: /^msid-semantic:\s?(\w*) (\S*)/,
        names: ["semantic", "token"],
        format: "msid-semantic: %s %s"
        // space after ':' is not accidental
      },
      {
        // a=group:BUNDLE audio video
        push: "groups",
        reg: /^group:(\w*) (.*)/,
        names: ["type", "mids"],
        format: "group:%s %s"
      },
      {
        // a=rtcp-mux
        name: "rtcpMux",
        reg: /^(rtcp-mux)/
      },
      {
        // a=rtcp-rsize
        name: "rtcpRsize",
        reg: /^(rtcp-rsize)/
      },
      {
        // a=sctpmap:5000 webrtc-datachannel 1024
        name: "sctpmap",
        reg: /^sctpmap:([\w_/]*) (\S*)(?: (\S*))?/,
        names: ["sctpmapNumber", "app", "maxMessageSize"],
        format: function(e) {
          return e.maxMessageSize != null ? "sctpmap:%s %s %s" : "sctpmap:%s %s";
        }
      },
      {
        // a=x-google-flag:conference
        name: "xGoogleFlag",
        reg: /^x-google-flag:([^\s]*)/,
        format: "x-google-flag:%s"
      },
      {
        // a=rid:1 send max-width=1280;max-height=720;max-fps=30;depend=0
        push: "rids",
        reg: /^rid:([\d\w]+) (\w+)(?: ([\S| ]*))?/,
        names: ["id", "direction", "params"],
        format: function(e) {
          return e.params ? "rid:%s %s %s" : "rid:%s %s";
        }
      },
      {
        // a=imageattr:97 send [x=800,y=640,sar=1.1,q=0.6] [x=480,y=320] recv [x=330,y=250]
        // a=imageattr:* send [x=800,y=640] recv *
        // a=imageattr:100 recv [x=320,y=240]
        push: "imageattrs",
        reg: new RegExp(
          // a=imageattr:97
          "^imageattr:(\\d+|\\*)[\\s\\t]+(send|recv)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*)(?:[\\s\\t]+(recv|send)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*))?"
        ),
        names: ["pt", "dir1", "attrs1", "dir2", "attrs2"],
        format: function(e) {
          return "imageattr:%s %s %s" + (e.dir2 ? " %s %s" : "");
        }
      },
      {
        // a=simulcast:send 1,2,3;~4,~5 recv 6;~7,~8
        // a=simulcast:recv 1;4,5 send 6;7
        name: "simulcast",
        reg: new RegExp(
          // a=simulcast:
          "^simulcast:(send|recv) ([a-zA-Z0-9\\-_~;,]+)(?:\\s?(send|recv) ([a-zA-Z0-9\\-_~;,]+))?$"
        ),
        names: ["dir1", "list1", "dir2", "list2"],
        format: function(e) {
          return "simulcast:%s %s" + (e.dir2 ? " %s %s" : "");
        }
      },
      {
        // old simulcast draft 03 (implemented by Firefox)
        //   https://tools.ietf.org/html/draft-ietf-mmusic-sdp-simulcast-03
        // a=simulcast: recv pt=97;98 send pt=97
        // a=simulcast: send rid=5;6;7 paused=6,7
        name: "simulcast_03",
        reg: /^simulcast:[\s\t]+([\S+\s\t]+)$/,
        names: ["value"],
        format: "simulcast: %s"
      },
      {
        // a=framerate:25
        // a=framerate:29.97
        name: "framerate",
        reg: /^framerate:(\d+(?:$|\.\d+))/,
        format: "framerate:%s"
      },
      {
        // RFC4570
        // a=source-filter: incl IN IP4 239.5.2.31 10.1.15.5
        name: "sourceFilter",
        reg: /^source-filter: *(excl|incl) (\S*) (IP4|IP6|\*) (\S*) (.*)/,
        names: ["filterMode", "netType", "addressTypes", "destAddress", "srcList"],
        format: "source-filter: %s %s %s %s %s"
      },
      {
        // a=bundle-only
        name: "bundleOnly",
        reg: /^(bundle-only)/
      },
      {
        // a=label:1
        name: "label",
        reg: /^label:(.+)/,
        format: "label:%s"
      },
      {
        // RFC version 26 for SCTP over DTLS
        // https://tools.ietf.org/html/draft-ietf-mmusic-sctp-sdp-26#section-5
        name: "sctpPort",
        reg: /^sctp-port:(\d+)$/,
        format: "sctp-port:%s"
      },
      {
        // RFC version 26 for SCTP over DTLS
        // https://tools.ietf.org/html/draft-ietf-mmusic-sctp-sdp-26#section-6
        name: "maxMessageSize",
        reg: /^max-message-size:(\d+)$/,
        format: "max-message-size:%s"
      },
      {
        // RFC7273
        // a=ts-refclk:ptp=IEEE1588-2008:39-A7-94-FF-FE-07-CB-D0:37
        push: "tsRefClocks",
        reg: /^ts-refclk:([^\s=]*)(?:=(\S*))?/,
        names: ["clksrc", "clksrcExt"],
        format: function(e) {
          return "ts-refclk:%s" + (e.clksrcExt != null ? "=%s" : "");
        }
      },
      {
        // RFC7273
        // a=mediaclk:direct=963214424
        name: "mediaClk",
        reg: /^mediaclk:(?:id=(\S*))? *([^\s=]*)(?:=(\S*))?(?: *rate=(\d+)\/(\d+))?/,
        names: ["id", "mediaClockName", "mediaClockValue", "rateNumerator", "rateDenominator"],
        format: function(e) {
          var t = "mediaclk:";
          return t += e.id != null ? "id=%s %s" : "%v%s", t += e.mediaClockValue != null ? "=%s" : "", t += e.rateNumerator != null ? " rate=%s" : "", t += e.rateDenominator != null ? "/%s" : "", t;
        }
      },
      {
        // a=keywds:keywords
        name: "keywords",
        reg: /^keywds:(.+)$/,
        format: "keywds:%s"
      },
      {
        // a=content:main
        name: "content",
        reg: /^content:(.+)/,
        format: "content:%s"
      },
      // BFCP https://tools.ietf.org/html/rfc4583
      {
        // a=floorctrl:c-s
        name: "bfcpFloorCtrl",
        reg: /^floorctrl:(c-only|s-only|c-s)/,
        format: "floorctrl:%s"
      },
      {
        // a=confid:1
        name: "bfcpConfId",
        reg: /^confid:(\d+)/,
        format: "confid:%s"
      },
      {
        // a=userid:1
        name: "bfcpUserId",
        reg: /^userid:(\d+)/,
        format: "userid:%s"
      },
      {
        // a=floorid:1
        name: "bfcpFloorId",
        reg: /^floorid:(.+) (?:m-stream|mstrm):(.+)/,
        names: ["id", "mStream"],
        format: "floorid:%s mstrm:%s"
      },
      {
        // any a= that we don't understand is kept verbatim on media.invalid
        push: "invalid",
        names: ["value"]
      }
    ]
  };
  return Object.keys(i).forEach(function(e) {
    var t = i[e];
    t.forEach(function(n) {
      n.reg || (n.reg = /(.*)/), n.format || (n.format = "%s");
    });
  }), Mr.exports;
}
var Eo;
function Qp() {
  return Eo || (Eo = 1, (function(i) {
    var e = function(a) {
      return String(Number(a)) === a ? Number(a) : a;
    }, t = function(a, c, d, l) {
      if (l && !d)
        c[l] = e(a[1]);
      else
        for (var u = 0; u < d.length; u += 1)
          a[u + 1] != null && (c[d[u]] = e(a[u + 1]));
    }, n = function(a, c, d) {
      var l = a.name && a.names;
      a.push && !c[a.push] ? c[a.push] = [] : l && !c[a.name] && (c[a.name] = {});
      var u = a.push ? {} : (
        // blank object that will be pushed
        l ? c[a.name] : c
      );
      t(d.match(a.reg), u, a.names, a.name), a.push && c[a.push].push(u);
    }, r = ha(), s = RegExp.prototype.test.bind(/^([a-z])=(.*)/);
    i.parse = function(a) {
      var c = {}, d = [], l = c;
      return a.split(/(\r\n|\r|\n)/).filter(s).forEach(function(u) {
        var h = u[0], f = u.slice(2);
        h === "m" && (d.push({
          rtp: [],
          fmtp: []
        }), l = d[d.length - 1]);
        for (var g = 0; g < (r[h] || []).length; g += 1) {
          var p = r[h][g];
          if (p.reg.test(f))
            return n(p, l, f);
        }
      }), c.media = d, c;
    };
    var o = function(a, c) {
      var d = c.split(/=(.+)/, 2);
      return d.length === 2 ? a[d[0]] = e(d[1]) : d.length === 1 && c.length > 1 && (a[d[0]] = void 0), a;
    };
    i.parseParams = function(a) {
      return a.split(/;\s?/).reduce(o, {});
    }, i.parseFmtpConfig = i.parseParams, i.parsePayloads = function(a) {
      return a.toString().split(" ").map(Number);
    }, i.parseRemoteCandidates = function(a) {
      for (var c = [], d = a.split(" ").map(e), l = 0; l < d.length; l += 3)
        c.push({
          component: d[l],
          ip: d[l + 1],
          port: d[l + 2]
        });
      return c;
    }, i.parseImageAttributes = function(a) {
      return a.split(" ").map(function(c) {
        return c.substring(1, c.length - 1).split(",").reduce(o, {});
      });
    }, i.parseSimulcastStreamList = function(a) {
      return a.split(";").map(function(c) {
        return c.split(",").map(function(d) {
          var l, u = !1;
          return d[0] !== "~" ? l = e(d) : (l = e(d.substring(1, d.length)), u = !0), {
            scid: l,
            paused: u
          };
        });
      });
    };
  })(xr)), xr;
}
var Or, _o;
function Yp() {
  if (_o) return Or;
  _o = 1;
  var i = ha(), e = /%[sdv%]/g, t = function(o) {
    var a = 1, c = arguments, d = c.length;
    return o.replace(e, function(l) {
      if (a >= d)
        return l;
      var u = c[a];
      switch (a += 1, l) {
        case "%%":
          return "%";
        case "%s":
          return String(u);
        case "%d":
          return Number(u);
        case "%v":
          return "";
      }
    });
  }, n = function(o, a, c) {
    var d = a.format instanceof Function ? a.format(a.push ? c : c[a.name]) : a.format, l = [o + "=" + d];
    if (a.names)
      for (var u = 0; u < a.names.length; u += 1) {
        var h = a.names[u];
        a.name ? l.push(c[a.name][h]) : l.push(c[a.names[u]]);
      }
    else
      l.push(c[a.name]);
    return t.apply(null, l);
  }, r = ["v", "o", "s", "i", "u", "e", "p", "c", "b", "t", "r", "z", "a"], s = ["i", "c", "b", "a"];
  return Or = function(o, a) {
    a = a || {}, o.version == null && (o.version = 0), o.name == null && (o.name = " "), o.media.forEach(function(u) {
      u.payloads == null && (u.payloads = "");
    });
    var c = a.outerOrder || r, d = a.innerOrder || s, l = [];
    return c.forEach(function(u) {
      i[u].forEach(function(h) {
        h.name in o && o[h.name] != null ? l.push(n(u, h, o)) : h.push in o && o[h.push] != null && o[h.push].forEach(function(f) {
          l.push(n(u, h, f));
        });
      });
    }), o.media.forEach(function(u) {
      l.push(n("m", i.m[0], u)), d.forEach(function(h) {
        i[h].forEach(function(f) {
          f.name in u && u[f.name] != null ? l.push(n(h, f, u)) : f.push in u && u[f.push] != null && u[f.push].forEach(function(g) {
            l.push(n(h, f, g));
          });
        });
      });
    }), l.join(`\r
`) + `\r
`;
  }, Or;
}
var Po;
function Xp() {
  if (Po) return We;
  Po = 1;
  var i = Qp(), e = Yp(), t = ha();
  return We.grammar = t, We.write = e, We.parse = i.parse, We.parseParams = i.parseParams, We.parseFmtpConfig = i.parseFmtpConfig, We.parsePayloads = i.parsePayloads, We.parseRemoteCandidates = i.parseRemoteCandidates, We.parseImageAttributes = i.parseImageAttributes, We.parseSimulcastStreamList = i.parseSimulcastStreamList, We;
}
var Ue = Xp();
function fa(i) {
  let e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 50, t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
  var n, r;
  let s;
  const o = (n = t.isImmediate) !== null && n !== void 0 ? n : !1, a = (r = t.callback) !== null && r !== void 0 ? r : !1, c = t.maxWait;
  let d = Date.now(), l = [];
  function u() {
    if (c !== void 0) {
      const f = Date.now() - d;
      if (f + e >= c)
        return c - f;
    }
    return e;
  }
  const h = function() {
    for (var f = arguments.length, g = new Array(f), p = 0; p < f; p++)
      g[p] = arguments[p];
    const y = this;
    return new Promise((k, w) => {
      const A = function() {
        if (s = void 0, d = Date.now(), !o) {
          const T = i.apply(y, g);
          a && a(T), l.forEach((S) => {
            let I = S.resolve;
            return I(T);
          }), l = [];
        }
      }, b = o && s === void 0;
      if (s !== void 0 && z.clearTimeout(s), s = z.setTimeout(A, u()), b) {
        const T = i.apply(y, g);
        return a && a(T), k(T);
      }
      l.push({
        resolve: k,
        reject: w
      });
    });
  };
  return h.cancel = function(f) {
    s !== void 0 && z.clearTimeout(s), l.forEach((g) => {
      let p = g.reject;
      return p(f);
    }), l = [];
  }, h;
}
const Zp = 0.9, Mi = 1e3, pa = 300, Ro = 1500, em = 3500, tm = 500, nm = 20;
function pl(i, e, t) {
  var n, r, s;
  if (!((n = i.msid) === null || n === void 0) && n.includes(e))
    return (s = (r = i.rtp.find((o) => o.codec.toUpperCase() === t.toUpperCase())) === null || r === void 0 ? void 0 : r.payload) !== null && s !== void 0 ? s : 0;
}
function im(i, e) {
  if (i.maxbr < pa)
    return;
  const t = Math.min(Math.round(i.maxbr * Zp), i.maxbr);
  if (i.isScreenShare)
    return t;
  const n = Math.min(sm(e), rm());
  return Math.min(t, n);
}
function rm() {
  const i = typeof navigator < "u" ? navigator.connection : void 0;
  switch (i?.effectiveType) {
    case "slow-2g":
    case "2g":
      return pa;
    case "3g":
      return tm;
    default:
      return Mi;
  }
}
function sm(i) {
  if (i === void 0)
    return Mi;
  const e = Math.min(Math.max((i - Ro) / (em - Ro), 0), 1);
  return Math.round(Mi - e * (Mi - pa));
}
function am(i, e, t) {
  let n;
  for (const r of i)
    if (!(r.type !== "video" || r.direction === "recvonly" || r.direction === "inactive"))
      for (const s of e) {
        if (!s.cid)
          continue;
        const o = pl(r, s.cid, s.codec);
        if (o === void 0)
          continue;
        const a = o > 0 ? im(s, t) : void 0;
        a !== void 0 && (n === void 0 || a > n) && (n = a);
        break;
      }
  return n;
}
function om(i, e, t) {
  const n = i.fmtp.find((r) => r.payload === e);
  return n ? n.config.includes("x-google-start-bitrate") || (n.config += ";x-google-start-bitrate=".concat(t)) : i.fmtp.push({
    payload: e,
    config: "x-google-start-bitrate=".concat(t)
  }), !0;
}
const _t = {
  NegotiationStarted: "negotiationStarted",
  NegotiationComplete: "negotiationComplete",
  // Fired with the offerId for every successful publisher answer application,
  // including answers that immediately recurse into another offer via
  // `renegotiate`. Use this rather than NegotiationComplete to know that a
  // specific offer has been negotiated end-to-end.
  OfferAnswered: "offerAnswered",
  RTPVideoPayloadTypes: "rtpVideoPayloadTypes"
};
class Io extends xe.EventEmitter {
  get pc() {
    return this._pc || (this._pc = this.createPC()), this._pc;
  }
  constructor(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var n;
    super(), this.log = q, this.iceLog = q, this.ddExtID = 0, this.latestOfferId = 0, this.answeredOfferId = 0, this.latestAcknowledgedOfferId = 0, this.pendingCandidates = [], this.restartingIce = !1, this.renegotiate = !1, this.trackBitrates = [], this.hasAppliedVideoStartBitrate = !1, this.remoteStereoMids = [], this.remoteNackMids = [], this.negotiate = fa((r) => m(this, void 0, void 0, function* () {
      this.emit(_t.NegotiationStarted);
      try {
        yield this.createAndSendOffer();
      } catch (s) {
        if (r)
          r(s);
        else
          throw s;
      }
    }), nm), this.close = () => {
      this._pc && (this.log.debug("closing peer connection"), this.pendingInitialOffer = void 0, this._pc.close(), this._pc.onconnectionstatechange = null, this._pc.oniceconnectionstatechange = null, this._pc.onicegatheringstatechange = null, this._pc.ondatachannel = null, this._pc.onnegotiationneeded = null, this._pc.onsignalingstatechange = null, this._pc.onicecandidate = null, this._pc.ondatachannel = null, this._pc.ontrack = null, this._pc.onconnectionstatechange = null, this._pc.oniceconnectionstatechange = null, this._pc = null);
    }, this.loggerOptions = t, this.log = pe((n = t.loggerName) !== null && n !== void 0 ? n : ne.PCTransport, () => this.logContext), this.iceLog = pe(ne.ICE, () => this.logContext), this.config = e, this._pc = this.createPC(), this.offerLock = new fe();
  }
  createPC() {
    const e = new RTCPeerConnection(this.config);
    return e.onicecandidate = (t) => {
      var n;
      t.candidate && (this.iceLog.debug("local ICE candidate gathered", {
        candidate: t.candidate.candidate
      }), (n = this.onIceCandidate) === null || n === void 0 || n.call(this, t.candidate));
    }, e.onicecandidateerror = (t) => {
      var n;
      this.iceLog.debug("ICE candidate error", {
        event: t
      }), (n = this.onIceCandidateError) === null || n === void 0 || n.call(this, t);
    }, e.oniceconnectionstatechange = () => {
      var t;
      this.iceLog.debug("ICE connection state: ".concat(e.iceConnectionState)), (t = this.onIceConnectionStateChange) === null || t === void 0 || t.call(this, e.iceConnectionState);
    }, e.onsignalingstatechange = () => {
      var t;
      this.log.debug("signaling state: ".concat(e.signalingState)), (t = this.onSignalingStatechange) === null || t === void 0 || t.call(this, e.signalingState);
    }, e.onconnectionstatechange = () => {
      var t;
      this.log.debug("connection state: ".concat(e.connectionState)), (t = this.onConnectionStateChange) === null || t === void 0 || t.call(this, e.connectionState);
    }, e.ondatachannel = (t) => {
      var n;
      this.log.debug("data channel opened by peer", {
        label: t.channel.label,
        id: t.channel.id
      }), (n = this.onDataChannel) === null || n === void 0 || n.call(this, t);
    }, e.ontrack = (t) => {
      var n;
      (n = this.onTrack) === null || n === void 0 || n.call(this, t);
    }, e;
  }
  get logContext() {
    var e, t;
    return Object.assign({}, (t = (e = this.loggerOptions).loggerContextCb) === null || t === void 0 ? void 0 : t.call(e));
  }
  get isICEConnected() {
    return this._pc !== null && (this.pc.iceConnectionState === "connected" || this.pc.iceConnectionState === "completed");
  }
  addIceCandidate(e) {
    return m(this, void 0, void 0, function* () {
      if (this.pc.remoteDescription && !this.restartingIce)
        return this.pc.addIceCandidate(e);
      this.iceLog.debug("queuing remote ICE candidate until remote description applied", {
        pendingCount: this.pendingCandidates.length + 1
      }), this.pendingCandidates.push(e);
    });
  }
  /** Whether an answer for `offerId` answers an offer older than the latest one sent. */
  isStaleAnswer(e) {
    return this.latestOfferId > 0 && e > 0 && e !== this.latestOfferId;
  }
  setRemoteDescription(e, t) {
    return m(this, void 0, void 0, function* () {
      var n;
      if (e.type === "answer" && this.isStaleAnswer(t))
        return this.log.warn("ignoring answer for old offer", {
          offerId: t,
          latestOfferId: this.latestOfferId
        }), !1;
      if (e.type === "answer") {
        if (fm(t, this.answerInFlight, this.answeredOfferId, (n = this._pc) === null || n === void 0 ? void 0 : n.signalingState, this.pendingInitialOffer !== void 0))
          return this.log.warn("ignoring duplicate answer", {
            offerId: t
          }), !1;
        this.answerInFlight = t;
      }
      try {
        return yield this.applyRemoteDescription(e, t);
      } finally {
        e.type === "answer" && (this.answerInFlight = void 0);
      }
    });
  }
  applyRemoteDescription(e, t) {
    return m(this, void 0, void 0, function* () {
      var n, r;
      let s;
      if (e.type === "offer") {
        let o = pm(e), a = o.stereoMids, c = o.nackMids;
        this.remoteStereoMids = a, this.remoteNackMids = c;
      } else if (e.type === "answer") {
        if (this.pendingInitialOffer && this._pc) {
          const c = this.pendingInitialOffer;
          this.pendingInitialOffer = void 0;
          const d = Ue.parse((n = c.sdp) !== null && n !== void 0 ? n : "");
          d.media.forEach((l) => {
            fi(l);
          }), this.log.debug("setting pending initial offer before processing answer"), yield this.setMungedSDP(c, Ue.write(d));
        }
        const o = Ue.parse((r = e.sdp) !== null && r !== void 0 ? r : "");
        o.media.forEach((c) => {
          const d = jn(c.mid);
          c.type === "audio" && this.trackBitrates.some((l) => {
            if (!l.transceiver || d != l.transceiver.mid)
              return !1;
            let u = 0;
            if (c.rtp.some((f) => f.codec.toUpperCase() === l.codec.toUpperCase() ? (u = f.payload, !0) : !1), u === 0)
              return !0;
            let h = !1;
            for (const f of c.fmtp)
              if (f.payload === u) {
                f.config = f.config.split(";").filter((g) => !g.includes("maxaveragebitrate")).join(";"), l.maxbr > 0 && (f.config += ";maxaveragebitrate=".concat(l.maxbr * 1e3)), h = !0;
                break;
              }
            return h || l.maxbr > 0 && c.fmtp.push({
              payload: u,
              config: "maxaveragebitrate=".concat(l.maxbr * 1e3)
            }), !0;
          });
        });
        const a = this.getPlaceholderMids();
        a.size > 0 && Mo(o.media, (c) => a.has(jn(c.mid))), s = Ue.write(o);
      }
      return yield this.setMungedSDP(e, s, !0), e.type === "answer" && t > 0 && (this.answeredOfferId = t), this.pendingCandidates.length > 0 && this.iceLog.debug("flushing queued ICE candidates", {
        count: this.pendingCandidates.length
      }), this.pendingCandidates.forEach((o) => {
        this.pc.addIceCandidate(o);
      }), this.pendingCandidates = [], this.restartingIce = !1, e.type === "answer" && (this.latestAcknowledgedOfferId = t, this.emit(_t.OfferAnswered, t)), this.renegotiate ? (this.renegotiate = !1, yield this.createAndSendOffer()) : e.type === "answer" && (this.emit(_t.NegotiationComplete), e.sdp && Ue.parse(e.sdp).media.forEach((a) => {
        a.type === "video" && this.emit(_t.RTPVideoPayloadTypes, a.rtp);
      })), !0;
    });
  }
  createInitialOffer() {
    return m(this, void 0, void 0, function* () {
      var e;
      const t = yield this.offerLock.lock();
      try {
        if (this.pc.signalingState !== "stable") {
          this.log.warn("signaling state is not stable, cannot create initial offer");
          return;
        }
        const n = this.latestOfferId + 1;
        this.latestOfferId = n;
        const r = yield this.pc.createOffer();
        this.pendingInitialOffer = {
          sdp: r.sdp,
          type: r.type
        };
        const s = Ue.parse((e = r.sdp) !== null && e !== void 0 ? e : "");
        return s.media.forEach((o) => {
          fi(o);
        }), r.sdp = Ue.write(s), {
          offer: r,
          offerId: n
        };
      } finally {
        t();
      }
    });
  }
  createAndSendOffer(e) {
    return m(this, void 0, void 0, function* () {
      var t;
      const n = yield this.offerLock.lock();
      try {
        if (this.onOffer === void 0)
          return;
        if (e?.iceRestart && (this.iceLog.debug("restarting ICE"), this.restartingIce = !0), this._pc && (this._pc.signalingState === "have-local-offer" || this.pendingInitialOffer)) {
          const u = this._pc.remoteDescription;
          if (e?.iceRestart && u)
            yield this._pc.setRemoteDescription(u);
          else {
            if (e?.iceRestart)
              throw new At("ICE restart requested without a remote description, peer connection must be recreated");
            this.renegotiate = !0, this.log.debug("requesting renegotiation");
            return;
          }
        } else if (!this._pc || this._pc.signalingState === "closed") {
          this.log.warn("could not createOffer with closed peer connection");
          return;
        }
        this.log.debug("starting to negotiate");
        const r = this.latestOfferId + 1;
        this.latestOfferId = r;
        const s = yield this.pc.createOffer(e);
        this.log.debug("original offer", {
          sdp: s.sdp
        });
        const o = Ue.parse((t = s.sdp) !== null && t !== void 0 ? t : ""), a = this.hasAppliedVideoStartBitrate ? void 0 : am(o.media, this.trackBitrates, this.connectionSetupTimeEstimateMs());
        let c = !1;
        o.media.forEach((u) => {
          fi(u), u.type === "audio" ? xo(u, ["all"], []) : u.type === "video" && this.trackBitrates.some((h) => {
            if (!h.cid)
              return !1;
            const f = pl(u, h.cid, h.codec);
            return f === void 0 ? !1 : (f > 0 && (a !== void 0 && (c = om(u, f, a) || c), Lt(h.codec) && !Gt() && (this.ddExtID = cm(u, o, this.ddExtID))), !0);
          });
        });
        const d = this.getPlaceholderMids();
        if (d.size > 0 && Mo(o.media, (u) => d.has(jn(u.mid))), this.latestOfferId > r) {
          this.log.warn("latestOfferId mismatch", {
            latestOfferId: this.latestOfferId,
            offerId: r
          });
          return;
        }
        const l = Ue.write(o);
        yield this.setMungedSDP(s, l), c && s.sdp === l && (this.hasAppliedVideoStartBitrate = !0, this.log.info("applied x-google-start-bitrate", {
          startBitrateKbps: a,
          connectionSetupTimeMs: this.connectionSetupTimeEstimateMs()
        })), this.onOffer(s, this.latestOfferId);
      } finally {
        n();
      }
    });
  }
  createAndSetAnswer() {
    return m(this, void 0, void 0, function* () {
      var e;
      const t = yield this.pc.createAnswer(), n = Ue.parse((e = t.sdp) !== null && e !== void 0 ? e : "");
      return n.media.forEach((r) => {
        fi(r), r.type === "audio" && xo(r, this.remoteStereoMids, this.remoteNackMids);
      }), yield this.setMungedSDP(t, Ue.write(n)), t;
    });
  }
  /**
   * Returns the mids of transceivers that carry no outgoing track on this
   * (publisher) connection: the pre-populated placeholders added by
   * `RTCEngine.applyInitialPublisherLayout`, plus any transceiver that was used
   * for a track and reverted on unpublish. Their codec fmtp is conformed to the
   * published tracks so a shared payload type stays consistent across the bundle.
   */
  getPlaceholderMids() {
    var e, t;
    return hm((t = (e = this._pc) === null || e === void 0 ? void 0 : e.getTransceivers()) !== null && t !== void 0 ? t : []);
  }
  createDataChannel(e, t) {
    return this.pc.createDataChannel(e, t);
  }
  addTransceiver(e, t) {
    return this.pc.addTransceiver(e, t);
  }
  addTransceiverOfKind(e, t) {
    return this.pc.addTransceiver(e, t);
  }
  addTrack(e) {
    if (!this._pc)
      throw new $("PC closed, cannot add track");
    return this._pc.addTrack(e);
  }
  setTrackCodecBitrate(e) {
    this.trackBitrates.push(e);
  }
  /**
   * Record how long this peer connection took to set up. Called once, when the initial connect
   * succeeds; resumes and ICE restarts keep the estimator they have and never call this.
   */
  setConnectionSetupTime(e) {
    this.connectionSetupTimeMs = e;
  }
  /** Record when the connection attempt that built this peer connection began. */
  setConnectionStartedAt(e) {
    this.connectionStartedAt = e;
  }
  /** The measured setup time, or while still connecting, the time elapsed so far. */
  connectionSetupTimeEstimateMs() {
    if (this.connectionSetupTimeMs !== void 0)
      return this.connectionSetupTimeMs;
    if (this.connectionStartedAt !== void 0)
      return Math.round(performance.now() - this.connectionStartedAt);
  }
  setConfiguration(e) {
    var t;
    if (!this._pc)
      throw new $("PC closed, cannot configure");
    return (t = this._pc) === null || t === void 0 ? void 0 : t.setConfiguration(e);
  }
  canRemoveTrack() {
    var e;
    return !!(!((e = this._pc) === null || e === void 0) && e.removeTrack);
  }
  removeTrack(e) {
    var t;
    return (t = this._pc) === null || t === void 0 ? void 0 : t.removeTrack(e);
  }
  getConnectionState() {
    var e, t;
    return (t = (e = this._pc) === null || e === void 0 ? void 0 : e.connectionState) !== null && t !== void 0 ? t : "closed";
  }
  getICEConnectionState() {
    var e, t;
    return (t = (e = this._pc) === null || e === void 0 ? void 0 : e.iceConnectionState) !== null && t !== void 0 ? t : "closed";
  }
  getSignallingState() {
    var e, t;
    return (t = (e = this._pc) === null || e === void 0 ? void 0 : e.signalingState) !== null && t !== void 0 ? t : "closed";
  }
  getTransceivers() {
    var e, t;
    return (t = (e = this._pc) === null || e === void 0 ? void 0 : e.getTransceivers()) !== null && t !== void 0 ? t : [];
  }
  getSenders() {
    var e, t;
    return (t = (e = this._pc) === null || e === void 0 ? void 0 : e.getSenders()) !== null && t !== void 0 ? t : [];
  }
  getLocalDescription() {
    var e;
    return (e = this._pc) === null || e === void 0 ? void 0 : e.localDescription;
  }
  getRemoteDescription() {
    var e;
    return (e = this.pc) === null || e === void 0 ? void 0 : e.remoteDescription;
  }
  /** stats of the underlying connection, `undefined` when there is none */
  getStats() {
    var e;
    return (e = this._pc) === null || e === void 0 ? void 0 : e.getStats();
  }
  getMaxMessageSize() {
    var e, t;
    return (t = (e = this._pc) === null || e === void 0 ? void 0 : e.sctp) === null || t === void 0 ? void 0 : t.maxMessageSize;
  }
  getConnectedAddress() {
    return m(this, void 0, void 0, function* () {
      var e;
      if (!this._pc)
        return;
      let t = "";
      const n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
      if ((yield this._pc.getStats()).forEach((a) => {
        switch (a.type) {
          case "transport":
            t = a.selectedCandidatePairId;
            break;
          case "candidate-pair":
            t === "" && a.selected && (t = a.id), n.set(a.id, a);
            break;
          case "remote-candidate":
            r.set(a.id, "".concat(a.address, ":").concat(a.port));
            break;
        }
      }), t === "")
        return;
      const o = (e = n.get(t)) === null || e === void 0 ? void 0 : e.remoteCandidateId;
      if (o !== void 0)
        return r.get(o);
    });
  }
  setMungedSDP(e, t, n) {
    return m(this, void 0, void 0, function* () {
      var r, s;
      const o = e.sdp;
      if (t) {
        e.sdp = t;
        try {
          this.log.debug("setting munged ".concat(n ? "remote" : "local", " description")), n ? yield this.pc.setRemoteDescription(e) : yield this.pc.setLocalDescription(e);
          return;
        } catch (a) {
          this.log.warn("not able to set ".concat(e.type, ", falling back to unmodified sdp"), {
            error: a,
            mungedSdp: t,
            originalSdp: o
          }), e.sdp = o;
        }
      }
      try {
        n ? yield (r = this._pc) === null || r === void 0 ? void 0 : r.setRemoteDescription(e) : yield (s = this._pc) === null || s === void 0 ? void 0 : s.setLocalDescription(e);
      } catch (a) {
        let c = "unknown error";
        a instanceof Error ? c = a.message : typeof a == "string" && (c = a);
        const d = {
          error: c,
          sdp: e.sdp
        };
        throw t && t !== o && (d.mungedSdp = t), !n && this.pc.remoteDescription && (d.remoteSdp = this.pc.remoteDescription), this.log.error("unable to set ".concat(e.type), {
          fields: d
        }), new At(c);
      }
    });
  }
}
function cm(i, e, t) {
  var n, r;
  const s = dm(e, t);
  return s === void 0 ? t : (!((n = i.ext) === null || n === void 0) && n.some((o) => o.uri === ln) || ((r = i.ext) !== null && r !== void 0 || (i.ext = []), i.ext.push({
    value: s,
    uri: ln
  })), s);
}
function dm(i, e) {
  const t = lm(i, ln);
  return t !== void 0 ? Ao(i, t, ln) ? void 0 : t : e !== 0 && !Ao(i, e, ln) ? e : um(i);
}
function lm(i, e) {
  var t;
  for (const n of i.media) {
    const r = (t = n.ext) === null || t === void 0 ? void 0 : t.find((s) => s.uri === e);
    if (r)
      return r.value;
  }
}
function Ao(i, e, t) {
  return i.media.some((n) => {
    var r;
    return (r = n.ext) === null || r === void 0 ? void 0 : r.some((s) => s.value === e && s.uri !== t);
  });
}
function um(i) {
  let e = 0;
  return i.media.forEach((t) => {
    var n;
    (n = t.ext) === null || n === void 0 || n.forEach((r) => {
      r.value > e && (e = r.value);
    });
  }), e + 1 === 15 ? 16 : e + 1;
}
function ml(i, e) {
  return i.split(";").some((t) => t.trim() === e);
}
function xo(i, e, t) {
  const n = jn(i.mid);
  let r = 0;
  i.rtp.some((s) => s.codec.toLowerCase() === "opus" ? (r = s.payload, !0) : !1), r > 0 && (i.rtcpFb || (i.rtcpFb = []), t.includes(n) && !i.rtcpFb.some((s) => s.payload === r && s.type === "nack") && i.rtcpFb.push({
    payload: r,
    type: "nack"
  }), (e.includes(n) || e.length === 1 && e[0] === "all") && i.fmtp.some((s) => s.payload === r ? (ml(s.config, "stereo=1") || (s.config += ";stereo=1"), !0) : !1));
}
function hm(i) {
  const e = /* @__PURE__ */ new Set();
  for (const t of i)
    t.mid && !t.sender.track && e.add(t.mid);
  return e;
}
function Mo(i, e) {
  var t, n, r, s, o, a, c, d;
  const l = /* @__PURE__ */ new Map();
  for (const u of i) {
    const h = e(u);
    for (const f of (t = u.rtp) !== null && t !== void 0 ? t : []) {
      const g = f.payload, p = (s = (r = (n = u.fmtp) === null || n === void 0 ? void 0 : n.find((y) => y.payload === g)) === null || r === void 0 ? void 0 : r.config) !== null && s !== void 0 ? s : "";
      (!h || !l.has(g)) && l.set(g, p);
    }
  }
  for (const u of i)
    if (e(u))
      for (const h of (o = u.rtp) !== null && o !== void 0 ? o : []) {
        const f = h.payload, g = l.get(f), p = (a = u.fmtp) === null || a === void 0 ? void 0 : a.find((y) => y.payload === f);
        g === "" ? u.fmtp = ((c = u.fmtp) !== null && c !== void 0 ? c : []).filter((y) => y.payload !== f) : p ? p.config = g : u.fmtp = [...(d = u.fmtp) !== null && d !== void 0 ? d : [], {
          payload: f,
          config: g
        }];
      }
}
function fm(i, e, t, n, r) {
  return e === i ? !0 : i > 0 ? i === t : n === "stable" && !r;
}
function pm(i) {
  var e;
  const t = [], n = [], r = Ue.parse((e = i.sdp) !== null && e !== void 0 ? e : "");
  let s = 0;
  return r.media.forEach((o) => {
    var a;
    const c = jn(o.mid);
    o.type === "audio" && (o.rtp.some((d) => d.codec.toLowerCase() === "opus" ? (s = d.payload, !0) : !1), !((a = o.rtcpFb) === null || a === void 0) && a.some((d) => d.payload === s && d.type === "nack") && n.push(c), o.fmtp.some((d) => d.payload === s ? (ml(d.config, "sprop-stereo=1") && t.push(c), !0) : !1));
  }), {
    stereoMids: t,
    nackMids: n
  };
}
function fi(i) {
  if (i.connection) {
    const e = i.connection.ip.indexOf(":") >= 0;
    (i.connection.version === 4 && e || i.connection.version === 6 && !e) && (i.connection.ip = "0.0.0.0", i.connection.version = 4);
  }
}
function jn(i) {
  return typeof i == "number" ? i.toFixed(0) : i;
}
const xn = 7e3, mm = 500, gm = [0, 300, 4 * 300, 9 * 300, 16 * 300, xn, xn, xn, xn, xn];
class vm {
  constructor(e) {
    this._retryDelays = e !== void 0 ? [...e] : gm;
  }
  nextRetryDelayInMs(e) {
    if (e.retryCount >= this._retryDelays.length) return null;
    const t = this._retryDelays[e.retryCount];
    return e.retryCount === 0 && t === 0 ? Math.random() * mm : Math.round(t * (0.5 + Math.random()));
  }
}
const ws = "vp8", bm = {
  audioPreset: Zr.music,
  dtx: !0,
  red: !0,
  forceStereo: !1,
  stopMicTrackOnMute: !1,
  preConnectBuffer: !1
}, gl = {
  deviceId: {
    ideal: "default"
  },
  autoGainControl: !0,
  echoCancellation: !0,
  noiseSuppression: !0,
  voiceIsolation: !0
}, ym = {
  adaptiveStream: !1,
  dynacast: !1,
  stopLocalTrackOnUnpublish: !0,
  reconnectPolicy: /* @__PURE__ */ new vm(),
  disconnectOnPageLeave: !0,
  webAudioMix: !1,
  singlePeerConnection: !0
}, ma = {
  autoSubscribe: !0,
  disableIceLite: !1,
  maxRetries: 1,
  peerConnectionTimeout: 15e3,
  websocketTimeout: 15e3
};
var X;
(function(i) {
  i[i.NEW = 0] = "NEW", i[i.CONNECTING = 1] = "CONNECTING", i[i.CONNECTED = 2] = "CONNECTED", i[i.FAILED = 3] = "FAILED", i[i.CLOSING = 4] = "CLOSING", i[i.CLOSED = 5] = "CLOSED";
})(X || (X = {}));
class Oo {
  get needsPublisher() {
    return this.isPublisherConnectionRequired;
  }
  get needsSubscriber() {
    return this.isSubscriberConnectionRequired;
  }
  get currentState() {
    return this.state;
  }
  get mode() {
    return this._mode;
  }
  constructor(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, r = n.rtcConfig, s = n.peerConnectionTimeout, o = s === void 0 ? ma.peerConnectionTimeout : s;
    var a;
    this.log = q, this.iceLog = q, this.updateState = () => {
      var c, d;
      const l = this.state, u = this.requiredTransports.map((h) => h.getConnectionState());
      u.every((h) => h === "connected") ? this.state = X.CONNECTED : u.some((h) => h === "failed") ? this.state = X.FAILED : u.some((h) => h === "connecting") ? this.state = X.CONNECTING : u.every((h) => h === "closed") ? this.state = X.CLOSED : u.some((h) => h === "closed") ? this.state = X.CLOSING : u.every((h) => h === "new") && (this.state = X.NEW), l !== this.state && (this.log.debug("pc state change: from ".concat(X[l], " to ").concat(X[this.state])), (c = this.onStateChange) === null || c === void 0 || c.call(this, this.state, this.publisher.getConnectionState(), (d = this.subscriber) === null || d === void 0 ? void 0 : d.getConnectionState()));
    }, this.loggerOptions = t, this.peerConnectionTimeout = o, this.log = pe((a = t.loggerName) !== null && a !== void 0 ? a : ne.PCManager, () => this.logContext), this.iceLog = pe(ne.ICE, () => this.logContext), this.isPublisherConnectionRequired = e !== "subscriber-primary", this.isSubscriberConnectionRequired = e === "subscriber-primary", this.publisher = new Io(r, t), this._mode = e, e !== "publisher-only" && (this.subscriber = new Io(r, t), this.subscriber.onConnectionStateChange = this.updateState, this.subscriber.onIceConnectionStateChange = this.updateState, this.subscriber.onSignalingStatechange = this.updateState, this.subscriber.onIceCandidate = (c) => {
      var d;
      (d = this.onIceCandidate) === null || d === void 0 || d.call(this, c, Oe.SUBSCRIBER);
    }, this.subscriber.onDataChannel = (c) => {
      var d;
      (d = this.onDataChannel) === null || d === void 0 || d.call(this, c);
    }, this.subscriber.onTrack = (c) => {
      var d;
      (d = this.onTrack) === null || d === void 0 || d.call(this, c);
    }), this.publisher.onConnectionStateChange = this.updateState, this.publisher.onIceConnectionStateChange = this.updateState, this.publisher.onSignalingStatechange = this.updateState, this.publisher.onIceCandidate = (c) => {
      var d;
      (d = this.onIceCandidate) === null || d === void 0 || d.call(this, c, Oe.PUBLISHER);
    }, this.publisher.onTrack = (c) => {
      var d;
      (d = this.onTrack) === null || d === void 0 || d.call(this, c);
    }, this.publisher.onOffer = (c, d) => {
      var l;
      (l = this.onPublisherOffer) === null || l === void 0 || l.call(this, c, d);
    }, this.state = X.NEW, this.connectionLock = new fe(), this.remoteOfferLock = new fe();
  }
  get logContext() {
    var e, t;
    return Object.assign({}, (t = (e = this.loggerOptions).loggerContextCb) === null || t === void 0 ? void 0 : t.call(e));
  }
  requirePublisher() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0;
    this.isPublisherConnectionRequired = e, this.updateState();
  }
  createAndSendPublisherOffer(e) {
    return this.publisher.createAndSendOffer(e);
  }
  setPublisherAnswer(e, t) {
    return this.publisher.setRemoteDescription(e, t);
  }
  removeTrack(e) {
    return this.publisher.removeTrack(e);
  }
  close() {
    return m(this, void 0, void 0, function* () {
      var e;
      if (this.publisher && this.publisher.getSignallingState() !== "closed") {
        const t = this.publisher;
        for (const n of t.getSenders())
          try {
            t.canRemoveTrack() && t.removeTrack(n);
          } catch (r) {
            this.log.warn("could not removeTrack", {
              error: r
            });
          }
      }
      yield Promise.all([this.publisher.close(), (e = this.subscriber) === null || e === void 0 ? void 0 : e.close()]), this.updateState();
    });
  }
  /**
   * Restarts ICE on the transports that need it. Only the publisher: the server restarts the
   * subscriber's ICE itself and follows with a fresh offer.
   *
   * The subscriber deliberately does NOT enter `restartingIce` here. Queueing its remote
   * candidates would guard against candidates for a new generation arriving before the offer
   * that introduces it, but the server does not send them in that order -- on a same-node
   * resume it buffers them until the offer has gone out, and on a reconnect that lands on
   * another node it withholds subscriber candidates until immediately before creating the
   * offer. Setting the flag only risks withholding candidates during the window that decides
   * whether the reconnect succeeded.
   */
  triggerIceRestart() {
    return m(this, void 0, void 0, function* () {
      this.iceLog.warn("triggering ICE restart"), this.needsPublisher && (yield this.createAndSendPublisherOffer({
        iceRestart: !0
      }));
    });
  }
  addIceCandidate(e, t) {
    return m(this, void 0, void 0, function* () {
      var n;
      this.iceLog.debug("adding remote ICE candidate", {
        target: t,
        candidate: e
      }), t === Oe.PUBLISHER ? yield this.publisher.addIceCandidate(e) : yield (n = this.subscriber) === null || n === void 0 ? void 0 : n.addIceCandidate(e);
    });
  }
  createSubscriberAnswerFromOffer(e, t) {
    return m(this, void 0, void 0, function* () {
      var n, r, s;
      this.log.debug("received server offer", {
        RTCSdpType: e.type,
        sdp: e.sdp,
        signalingState: (n = this.subscriber) === null || n === void 0 ? void 0 : n.getSignallingState().toString()
      });
      const o = yield this.remoteOfferLock.lock();
      try {
        return (yield (r = this.subscriber) === null || r === void 0 ? void 0 : r.setRemoteDescription(e, t)) ? yield (s = this.subscriber) === null || s === void 0 ? void 0 : s.createAndSetAnswer() : void 0;
      } finally {
        o();
      }
    });
  }
  updateConfiguration(e, t) {
    var n;
    this.log.debug("updating rtc configuration", {
      iceRestart: t
    }), this.publisher.setConfiguration(e), (n = this.subscriber) === null || n === void 0 || n.setConfiguration(e), t && this.triggerIceRestart();
  }
  ensurePCTransportConnection(e, t) {
    return m(this, void 0, void 0, function* () {
      var n;
      const r = yield this.connectionLock.lock();
      try {
        this.isPublisherConnectionRequired && this.publisher.getConnectionState() !== "connected" && this.publisher.getConnectionState() !== "connecting" && (this.log.debug("negotiation required, start negotiating"), this.publisher.negotiate().catch((s) => {
          this.log.error(s);
        })), yield Promise.all((n = this.requiredTransports) === null || n === void 0 ? void 0 : n.map((s) => this.ensureTransportConnected(s, e, t)));
      } finally {
        r();
      }
    });
  }
  negotiate(e) {
    return m(this, void 0, void 0, function* () {
      return new Ee((t, n) => {
        const r = this.publisher.latestOfferId;
        if (this.publisher.latestAcknowledgedOfferId > r) {
          this.log.debug("negotiation already handled in more recent acknowledged offer", this.logContext), t();
          return;
        }
        let s = !1;
        const o = () => {
          s || (s = !0, clearTimeout(d), this.publisher.off(_t.OfferAnswered, a), e.signal.removeEventListener("abort", c));
        }, a = (l) => {
          l > r && (o(), t());
        }, c = () => {
          o(), n(new At("negotiation aborted"));
        }, d = setTimeout(() => {
          o(), n(new At("negotiation timed out"));
        }, this.peerConnectionTimeout);
        e.signal.addEventListener("abort", c), this.publisher.on(_t.OfferAnswered, a), this.publisher.negotiate((l) => {
          o(), l instanceof Error ? n(l) : n(new Error(String(l)));
        });
      });
    });
  }
  addPublisherTransceiver(e, t) {
    return this.publisher.addTransceiver(e, t);
  }
  addPublisherTransceiverOfKind(e, t) {
    return this.publisher.addTransceiverOfKind(e, t);
  }
  getTransceiverForReceiver(e) {
    return (this.subscriber ? this.subscriber.getTransceivers() : this.publisher.getTransceivers()).find((n) => n.receiver === e);
  }
  getMaxPublisherMessageSize() {
    return this.publisher.getMaxMessageSize();
  }
  addPublisherTrack(e) {
    return this.publisher.addTrack(e);
  }
  createPublisherDataChannel(e, t) {
    return this.publisher.createDataChannel(e, t);
  }
  /**
   * Returns the first required transport's address if no explicit target is specified
   */
  getConnectedAddress(e) {
    return e === Oe.PUBLISHER ? this.publisher.getConnectedAddress() : e === Oe.SUBSCRIBER ? this.publisher.getConnectedAddress() : this.requiredTransports[0].getConnectedAddress();
  }
  get requiredTransports() {
    const e = [];
    return this.isPublisherConnectionRequired && e.push(this.publisher), this.isSubscriberConnectionRequired && this.subscriber && e.push(this.subscriber), e;
  }
  ensureTransportConnected(e, t) {
    return m(this, arguments, void 0, function(n, r) {
      var s = this;
      let o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : this.peerConnectionTimeout;
      return (function* () {
        if (n.getConnectionState() !== "connected")
          return new Promise((c, d) => m(s, void 0, void 0, function* () {
            const l = () => {
              this.log.warn("abort transport connection"), z.clearTimeout(h), d(M.cancelled("room connection has been cancelled"));
            };
            let u = !1;
            const h = z.setTimeout(() => {
              u = !0, r?.signal.removeEventListener("abort", l), d(M.internal("could not establish pc connection"));
            }, o);
            for (r?.signal.aborted && l(), r?.signal.addEventListener("abort", l); this.state !== X.CONNECTED; ) {
              if (yield be(50), u)
                return;
              if (r?.signal.aborted) {
                d(M.cancelled("room connection has been cancelled"));
                return;
              }
            }
            z.clearTimeout(h), r?.signal.removeEventListener("abort", l), c();
          }));
      })();
    });
  }
}
class vl {
  constructor(e) {
    this.bufferStatusLow = !0, this.headroomLock = new fe(), this.waiterAbortController = new AbortController(), this.kind = e.kind, this.lowWaterMark = e.lowWaterMark, this.highWaterMark = e.highWaterMark, this.isEngineClosed = e.isEngineClosed, this.onBufferStatusChanged = e.onBufferStatusChanged;
  }
  /** The currently attached RTCDataChannel handle, if any. */
  get channelHandle() {
    return this.handle;
  }
  /**
   * Attaches the channel handle this wrapper controls. Replacing an existing handle closes it and
   * rejects parked waiters — their events would never fire again on the abandoned object — and
   * installs a fresh controller. Wrappers outlive their handles: this is the one place handle
   * turnover happens, so a handle the wrapper lets go of is never left open, and stranding a
   * waiter is structurally impossible.
   */
  attach(e) {
    const t = this.handle;
    this.handle = e, t && t !== e && this.release(t, "data channel replaced");
  }
  /** Detaches and closes the handle on teardown, rejecting parked waiters. */
  detach() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "data channel torn down";
    const t = this.handle;
    this.handle = void 0, t && this.release(t, e);
  }
  /**
   * Closes a handle the wrapper no longer controls. `close()` moves it to `closing` synchronously,
   * so senders still holding it (queued on the headroom lock) fail the open check once they get
   * the lock. Parked waiters are aborted directly instead of relying on the `close` event, which
   * fires asynchronously, if at all (the spec lets `pc.close()` skip it). Strip any handlers that
   * must not observe the close before calling this.
   */
  release(e, t) {
    this.invalidateWaiters(t), e.close();
  }
  getChannel() {
    return this.handle;
  }
  /**
   * Whether the send buffer has room to accept more data (the send gate). Senders proceed while
   * this is true and block once it goes false. Callers resolve the handle (and decide what an
   * absent one means) before asking.
   */
  isBelowHighWaterMark(e) {
    return e.bufferedAmount <= this.highWaterMark;
  }
  /**
   * Whether the send buffer has drained to its low-water mark. Drives the engine's public
   * DCBufferStatusChanged event.
   */
  isBelowLowWaterMark(e) {
    return e.bufferedAmount <= e.bufferedAmountLowThreshold;
  }
  /**
   * Acquires the headroom lock, resolving with the unlock function. Batch senders (the resume
   * replay) hold it across all of their sends so no other sender can interleave, calling
   * {@link waitForHeadroomWithoutLock} per message to respect flow control within the batch.
   */
  lockHeadroom() {
    return this.headroomLock.lock();
  }
  /**
   * Resolves once the caller may send on `dc`: immediately while its send buffer is at or below
   * the high-water mark, otherwise once the buffer has drained to the low-water mark (the
   * `bufferedamountlow` event). Callers are serialized through the headroom lock so that, when
   * the buffer drains, they refill it one at a time (up to the high-water mark) rather than all
   * sending at once and overflowing the SCTP send buffer (see livekit/client-sdk-js#1995). The
   * checks run inside the lock so queued callers proceed in FIFO order.
   *
   * The caller passes the handle it resolved before queueing, and the wait is against that one
   * handle throughout: if it was replaced meanwhile, it has been closed, so the wait rejects
   * rather than letting the caller send on the replacement out of turn.
   */
  waitForHeadroomWithLock(e) {
    return m(this, void 0, void 0, function* () {
      const t = yield this.lockHeadroom();
      try {
        yield this.waitForHeadroomWithoutLock(e);
      } finally {
        t();
      }
    });
  }
  /** Core wait of {@link waitForHeadroomWithLock}. The caller must hold the headroom lock. */
  waitForHeadroomWithoutLock(e) {
    return m(this, void 0, void 0, function* () {
      if (this.isEngineClosed())
        throw new $("engine closed");
      if (e.readyState !== "open")
        throw new $("DataChannel ".concat(this.kind, " is ").concat(e.readyState));
      if (this.isBelowHighWaterMark(e))
        return;
      const t = this.waiterAbortController.signal;
      yield new Ee((n, r) => {
        const s = () => {
          c(), n();
        }, o = () => {
          c(), r(new $("DataChannel ".concat(this.kind, " closed while draining the buffer")));
        }, a = () => {
          c(), r(new $("DataChannel ".concat(this.kind, " was replaced or torn down while waiting for headroom")));
        }, c = () => {
          e.removeEventListener("bufferedamountlow", s), e.removeEventListener("close", o), t.removeEventListener("abort", a);
        };
        if (t.aborted) {
          a();
          return;
        }
        e.addEventListener("bufferedamountlow", s), e.addEventListener("close", o), t.addEventListener("abort", a);
      });
    });
  }
  /** Rejects all parked headroom waiters; the next waiter gets a fresh controller. */
  invalidateWaiters(e) {
    this.waiterAbortController.abort(e), this.waiterAbortController = new AbortController();
  }
  /**
   * Recomputes whether the buffer has drained to the low-water mark and, if that changed since the
   * last check, notifies the status listener. Two independent triggers land here: a send (which
   * raises the buffer) and the `bufferedamountlow` drain event (which lowers it) — the latter has
   * no send to hang the work off, which is why this is a shared entry point rather than a tail of
   * `send`.
   */
  refreshBufferStatus() {
    var e;
    const t = this.getChannel();
    if (!t)
      return;
    const n = this.isBelowLowWaterMark(t);
    n !== this.bufferStatusLow && (this.bufferStatusLow = n, (e = this.onBufferStatusChanged) === null || e === void 0 || e.call(this, n));
  }
}
class Lo extends vl {
  constructor(e) {
    super(e), this.statCurrentBytes = 0, this.statByterate = 0, this.dropCount = 0, this.bufferFullBehavior = e.bufferFullBehavior, this.shouldSkipSends = e.shouldSkipSends;
  }
  /** Sends prepared bytes with this channel's full-buffer policy (drop or wait). */
  send(e) {
    return m(this, void 0, void 0, function* () {
      const t = this.getChannel();
      if (t) {
        switch (this.bufferFullBehavior) {
          case "wait":
            if (!this.isBelowHighWaterMark(t))
              try {
                yield this.waitForHeadroomWithLock(t);
              } catch (n) {
                if (this.isEngineClosed())
                  throw n;
                return;
              }
            break;
          case "drop":
            if (!this.isBelowLowWaterMark(t)) {
              this.dropCount += 1, this.dropCount % 100 === 0 && q.warn("dropping lossy data channel messages, total dropped: ".concat(this.dropCount));
              return;
            }
        }
        if (this.statCurrentBytes += e.byteLength, !this.shouldSkipSends())
          try {
            t.send(e), this.refreshBufferStatus();
          } catch (n) {
            if (n instanceof TypeError)
              q.error(n);
            else
              throw n;
          }
      }
    });
  }
  /**
   * Starts the once-per-second adjustment of the channel's `bufferedAmountLowThreshold` to the
   * observed byterate, keeping the drop gate at roughly 100ms of buffered latency (clamped to
   * the watermarks). Restarts cleanly if already running.
   */
  startThresholdTuning() {
    this.stopThresholdTuning(), this.statInterval = z.setInterval(() => {
      this.statByterate = this.statCurrentBytes, this.statCurrentBytes = 0;
      const e = this.getChannel();
      if (e) {
        const t = this.statByterate / 10;
        e.bufferedAmountLowThreshold = Math.min(Math.max(t, this.lowWaterMark), this.highWaterMark);
      }
    }, 1e3);
  }
  /** Stops the threshold tuning and resets the stats and drop counter. */
  stopThresholdTuning() {
    this.statByterate = 0, this.statCurrentBytes = 0, this.statInterval && (z.clearInterval(this.statInterval), this.statInterval = void 0), this.dropCount = 0;
  }
}
class Do {
  constructor() {
    this.buffer = [], this._totalSize = 0, this._sentSize = 0;
  }
  push(e) {
    this.buffer.push(e), this._totalSize += e.data.byteLength, e.sent && (this._sentSize += e.data.byteLength);
  }
  pop() {
    const e = this.buffer.shift();
    return e && (this._totalSize -= e.data.byteLength, e.sent && (this._sentSize -= e.data.byteLength)), e;
  }
  getAll() {
    return this.buffer.slice();
  }
  /** Every queued packet not yet handed to the channel, in sequence order. */
  getUnsent() {
    return this.buffer.filter((e) => !e.sent);
  }
  /** Marks a single queued packet as handed to the channel. */
  markSent(e) {
    e.sent || (e.sent = !0, this._sentSize += e.data.byteLength);
  }
  /**
   * Marks every queued packet as not-yet-sent. Used at the start of a resume replay: whatever is
   * still buffered was sent on the previous channel (or deferred) and must be re-handed to the
   * current one, so none of it counts as sent until the replay actually transmits it.
   */
  markAllUnsent() {
    for (const e of this.buffer)
      e.sent = !1;
    this._sentSize = 0;
  }
  popToSequence(e) {
    for (; this.buffer.length > 0 && this.buffer[0].sequence <= e; )
      this.pop();
  }
  alignBufferedAmount(e) {
    for (; this.buffer.length > 0; ) {
      const t = this.buffer[0];
      if (!t.sent || this._sentSize - t.data.byteLength <= e)
        break;
      this.pop();
    }
  }
  get length() {
    return this.buffer.length;
  }
}
class km extends vl {
  constructor(e) {
    super(e), this.messageBuffer = new Do(), this.sequence = 1, this.isDeferringSends = e.isDeferringSends;
  }
  /**
   * Claims the next packet sequence. The caller stamps it into the packet before serialization,
   * then passes it back to {@link send} so the replay buffer stays keyed by wire sequence.
   */
  nextSequence() {
    const e = this.sequence;
    return this.sequence += 1, e;
  }
  /**
   * Sends prepared bytes with reliable semantics. Resolves once the packet has either been handed
   * to the channel or queued for the resume replay; throws only when the engine is closed.
   */
  send(e, t) {
    return m(this, void 0, void 0, function* () {
      if (this.isDeferringSends()) {
        this.messageBuffer.push({
          data: e,
          sequence: t,
          sent: !1
        });
        return;
      }
      const n = this.getChannel();
      if (n) {
        try {
          yield this.waitForHeadroomWithLock(n);
        } catch (r) {
          if (this.isEngineClosed())
            throw r;
          this.messageBuffer.push({
            data: e,
            sequence: t,
            sent: !1
          });
          return;
        }
        if (this.isDeferringSends()) {
          this.messageBuffer.push({
            data: e,
            sequence: t,
            sent: !1
          });
          return;
        }
        this.messageBuffer.push({
          data: e,
          sequence: t,
          sent: !0
        }), n.send(e), this.refreshBufferStatus();
      }
    });
  }
  /**
   * Replays the buffered backlog after a resume: drops everything the server acked
   * (`lastMessageSeq`), then re-sends the rest in order. The headroom lock is held across the
   * whole replay — releasing it between messages would let a concurrent send (whose newer
   * sequence was already assigned before it queued on the lock) hit the wire mid-replay, and
   * receivers would then discard the remaining lower-sequence resent messages as duplicates.
   */
  replay(e) {
    return m(this, void 0, void 0, function* () {
      if (!this.getChannel())
        return;
      this.messageBuffer.popToSequence(e);
      const t = yield this.lockHeadroom();
      try {
        const n = this.getChannel();
        if (!n)
          throw new $("DataChannel not found, kind: ".concat(this.kind));
        this.messageBuffer.markAllUnsent();
        for (let r = this.messageBuffer.getUnsent(); r.length > 0; r = this.messageBuffer.getUnsent())
          for (const s of r)
            yield this.waitForHeadroomWithoutLock(n), n.send(s.data), this.messageBuffer.markSent(s);
      } finally {
        t();
      }
      this.refreshBufferStatus();
    });
  }
  /**
   * Before recomputing status, trim packets the transport has now delivered — a send or a drain
   * may have acked buffered packets, and the replay buffer is keyed off the channel's buffered
   * bytes.
   */
  refreshBufferStatus() {
    const e = this.channelHandle;
    e && this.messageBuffer.alignBufferedAmount(e.bufferedAmount), super.refreshBufferStatus();
  }
  /**
   * Drops all replay state and restarts sequencing. Only valid on a full reconnect, where the
   * session (and the receivers' sequence tracking) starts over.
   */
  reset() {
    this.messageBuffer = new Do(), this.sequence = 1;
  }
}
var j;
(function(i) {
  i[i.RELIABLE = 0] = "RELIABLE", i[i.LOSSY = 1] = "LOSSY", i[i.DATA_TRACK_LOSSY = 2] = "DATA_TRACK_LOSSY";
})(j || (j = {}));
const Tm = 64 * 1024, Sm = 1024 * 1024, Cm = 8 * 1024, wm = 256 * 1024;
function Em(i) {
  return i === j.RELIABLE ? Tm : Cm;
}
function _m(i) {
  return i === j.RELIABLE ? Sm : wm;
}
const No = "_lossy", Uo = "_reliable", Fo = "_data_track";
function Lr(i) {
  i.onbufferedamountlow = null, i.onclose = null, i.onclosing = null, i.onerror = null, i.onmessage = null, i.onopen = null;
}
class Pm {
  constructor(e) {
    this.negotiated = !1, this.opts = e;
    const t = (n) => ({
      kind: n,
      lowWaterMark: Em(n),
      highWaterMark: _m(n),
      isEngineClosed: e.isEngineClosed,
      onBufferStatusChanged: (r) => e.onBufferStatusChanged(n, r)
    });
    this.reliable = new km(Object.assign(Object.assign({}, t(j.RELIABLE)), {
      isDeferringSends: e.isReconnecting
    })), this.lossy = new Lo(Object.assign(Object.assign({}, t(j.LOSSY)), {
      // Classic lossy user data: a stale packet is worthless, so drop instead of queueing.
      bufferFullBehavior: "drop",
      shouldSkipSends: e.isReconnecting
    })), this.dataTrack = new Lo(Object.assign(Object.assign({}, t(j.DATA_TRACK_LOSSY)), {
      // Data tracks backpressure the producer instead — it decides what to skip at frame
      // granularity rather than the engine dropping arbitrary chunks out of frames.
      bufferFullBehavior: "wait",
      shouldSkipSends: e.isReconnecting
    }));
  }
  /** The flow-control wrapper for `kind`. */
  channelFor(e) {
    switch (e) {
      case j.RELIABLE:
        return this.reliable;
      case j.LOSSY:
        return this.lossy;
      case j.DATA_TRACK_LOSSY:
        return this.dataTrack;
    }
  }
  /** The raw RTCDataChannel handle for `kind`, publisher side by default. */
  getHandle(e) {
    if (!(arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1))
      return this.channelFor(e).channelHandle;
    switch (e) {
      case j.RELIABLE:
        return this.reliableSub;
      case j.LOSSY:
        return this.lossySub;
      case j.DATA_TRACK_LOSSY:
        return this.dataTrackSub;
    }
  }
  get hasPublisherChannels() {
    return !!(this.reliable.channelHandle || this.lossy.channelHandle || this.dataTrack.channelHandle);
  }
  /** Whether the current publisher channels were created as negotiated (fixed IDs). */
  get publisherChannelsNegotiated() {
    return this.hasPublisherChannels && this.negotiated;
  }
  /**
   * Creates the three publisher data channels on the given transport, wires their handlers, and
   * attaches them to the wrappers — attaching closes any replaced channel objects and rejects the
   * waiters still parked on them.
   *
   * With `negotiated`, the channels use fixed SCTP stream IDs agreed with the server instead of
   * the in-band DCEP open handshake, so the server can send on them right away.
   */
  createPublisherChannels(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
    for (const s of [this.lossy, this.reliable, this.dataTrack]) {
      const o = s.channelHandle;
      o && Lr(o);
    }
    const n = (s, o, a) => {
      o.onmessage = a, o.onerror = this.opts.onDataError, o.onclose = () => this.opts.onChannelClose(s.kind), o.bufferedAmountLowThreshold = s.lowWaterMark, o.onbufferedamountlow = () => s.refreshBufferStatus(), s.attach(o);
    }, r = (s) => t ? {
      negotiated: t,
      id: s
    } : {};
    n(this.lossy, e.createPublisherDataChannel(No, Object.assign({
      ordered: !1,
      maxRetransmits: 0
    }, r(vr.NDCI_LOSSY))), this.opts.onDataMessage), n(this.reliable, e.createPublisherDataChannel(Uo, Object.assign({
      ordered: !0
    }, r(vr.NDCI_RELIABLE))), this.opts.onDataMessage), n(this.dataTrack, e.createPublisherDataChannel(Fo, Object.assign({
      ordered: !1,
      maxRetransmits: 0
    }, r(vr.NDCI_DATA_TRACK))), this.opts.onDataTrackMessage), this.negotiated = t, this.lossy.startThresholdTuning();
  }
  /**
   * Adopts a subscriber-side data channel by label, wiring the matching receive handler.
   * Returns false for labels this manager doesn't own.
   */
  adoptSubscriberChannel(e) {
    let t;
    if (e.label === Uo)
      this.reliableSub = e, t = this.opts.onDataMessage;
    else if (e.label === No)
      this.lossySub = e, t = this.opts.onDataMessage;
    else if (e.label === Fo)
      this.dataTrackSub = e, t = this.opts.onDataTrackMessage;
    else
      return !1;
    return e.onmessage = t, !0;
  }
  /**
   * Tears down all channels for a peer-connection cleanup: strips handlers, closes the handles,
   * and resets the reliable session state. Detaching the publisher handles closes them and
   * rejects parked waiters (the spec allows `pc.close()` to transition channels to 'closed'
   * without firing events, so waiting for browser close events is not an option).
   */
  teardown() {
    const e = [this.lossy, this.reliable, this.dataTrack], t = [this.lossySub, this.reliableSub, this.dataTrackSub];
    for (const n of e) {
      const r = n.channelHandle;
      r && Lr(r), n.detach("peer connections cleaned up");
    }
    for (const n of t)
      n && (Lr(n), n.close());
    this.lossySub = void 0, this.reliableSub = void 0, this.dataTrackSub = void 0, this.reliable.reset();
  }
}
const Rm = 2 * 1e3, Dr = "leave-reconnect", Im = 10 * 1e3, Am = 3e4, xm = 3, Mm = 3;
var Be;
(function(i) {
  i[i.New = 0] = "New", i[i.Connected = 1] = "Connected", i[i.Disconnected = 2] = "Disconnected", i[i.Reconnecting = 3] = "Reconnecting", i[i.Closed = 4] = "Closed";
})(Be || (Be = {}));
const Bo = 64e3;
class Om extends xe.EventEmitter {
  get isClosed() {
    return this._isClosed;
  }
  get isNewlyCreated() {
    return this._isNewlyCreated;
  }
  get pendingReconnect() {
    return !!this.reconnectTimeout;
  }
  get serverVersion() {
    var e, t, n;
    return ((t = (e = this.latestJoinResponse) === null || e === void 0 ? void 0 : e.serverInfo) === null || t === void 0 ? void 0 : t.version) || ((n = this.latestJoinResponse) === null || n === void 0 ? void 0 : n.serverVersion) || void 0;
  }
  get reliableChannel() {
    return this.dataChannels.reliable;
  }
  get lossyChannel() {
    return this.dataChannels.lossy;
  }
  get dataTrackChannel() {
    return this.dataChannels.dataTrack;
  }
  constructor(e) {
    var t;
    super(), this.options = e, this.rtcConfig = {}, this.peerConnectionTimeout = ma.peerConnectionTimeout, this.fullReconnectOnNext = !1, this.latestRemoteOfferId = 0, this.subscriberPrimary = !1, this.pcState = Be.New, this._isClosed = !0, this._isNewlyCreated = !0, this.pendingTrackResolvers = {}, this.reconnectAttempts = 0, this.reconnectStart = 0, this.attemptingReconnect = !1, this.joinAttempts = 0, this.maxJoinAttempts = 1, this.shouldFailNext = !1, this.shouldFailOnV1Path = !1, this.log = q, this.reliableReceivedState = new $p(Am), this.midToTrackId = {}, this.isWaitingForNetworkReconnect = !1, this.pendingNegotiationAborts = /* @__PURE__ */ new Set(), this.handleDataChannel = (r) => m(this, [r], void 0, function(s) {
      var o = this;
      let a = s.channel;
      return (function* () {
        a && o.dataChannels.adoptSubscriberChannel(a) && o.log.debug("on data channel ".concat(a.id, ", ").concat(a.label));
      })();
    }), this.handleDataMessage = (r) => m(this, void 0, void 0, function* () {
      var s, o, a, c;
      const d = yield this.dataProcessLock.lock();
      try {
        const l = yield this.decodeDataMessage(r);
        if (!l)
          return;
        const u = Ae.fromBinary(l);
        if (u.sequence > 0 && u.participantSid !== "") {
          const h = this.reliableReceivedState.get(u.participantSid);
          if (h && u.sequence <= h)
            return;
          this.reliableReceivedState.set(u.participantSid, u.sequence);
        }
        if (((s = u.value) === null || s === void 0 ? void 0 : s.case) === "speaker")
          this.emit(P.ActiveSpeakersUpdate, u.value.value.speakers);
        else if (((o = u.value) === null || o === void 0 ? void 0 : o.case) === "encryptedPacket") {
          if (!this.e2eeManager) {
            this.log.error("Received encrypted packet but E2EE not set up");
            return;
          }
          let h;
          try {
            h = yield this.e2eeManager.handleEncryptedData(u.value.value.encryptedValue, u.value.value.iv, u.participantIdentity, u.value.value.keyIndex);
          } catch (p) {
            this.log.debug("failed to decrypt data packet", {
              error: p,
              participantIdentity: u.participantIdentity
            });
            return;
          }
          const f = Cd.fromBinary(h.payload), g = new Ae({
            value: f.value,
            participantIdentity: u.participantIdentity,
            participantSid: u.participantSid
          });
          ((a = g.value) === null || a === void 0 ? void 0 : a.case) === "user" && jo(g, g.value.value), this.emit(P.DataPacketReceived, g, u.value.value.encryptionType);
        } else
          ((c = u.value) === null || c === void 0 ? void 0 : c.case) === "user" && jo(u, u.value.value), this.emit(P.DataPacketReceived, u, H.NONE);
      } finally {
        d();
      }
    }), this.handleDataTrackMessage = (r) => m(this, void 0, void 0, function* () {
      const s = yield this.decodeDataMessage(r);
      s && this.emit("dataTrackPacketReceived", s);
    }), this.handleDataError = (r) => {
      if (this._isClosed)
        return;
      const o = r.currentTarget.maxRetransmits === 0 ? "lossy" : "reliable";
      if (typeof RTCErrorEvent < "u" && r instanceof RTCErrorEvent && r.error) {
        const a = r.error;
        this.log.error("DataChannel error on ".concat(o, ": ").concat(a.message), {
          error: a,
          errorDetail: a.errorDetail,
          sctpCauseCode: a.sctpCauseCode
        });
      } else
        this.log.error("Unknown DataChannel error on ".concat(o), {
          event: r
        });
    }, this.handleDataChannelClose = (r) => () => {
      var s;
      !this._isClosed && ((s = this.pcManager) === null || s === void 0 ? void 0 : s.publisher.getConnectionState()) === "connected" && this.log.error("publisher data channel '".concat(j[r], "' closed unexpectedly"), this.logContext);
    }, this.handleDisconnect = (r, s) => {
      if (this._isClosed)
        return;
      this.log.warn("".concat(r, " disconnected")), this.reconnectAttempts === 0 && (this.reconnectStart = Date.now());
      const o = (l) => {
        this.log.warn("could not recover connection after ".concat(this.reconnectAttempts, " attempts, ").concat(l, "ms. giving up")), this.emit(P.Disconnected), this.close("gave up reconnecting after ".concat(this.reconnectAttempts, " attempts, ").concat(l, "ms"));
      }, a = Date.now() - this.reconnectStart;
      let c = this.getNextRetryDelay({
        elapsedMs: a,
        retryCount: this.reconnectAttempts
      });
      if (c === null) {
        o(a);
        return;
      }
      if (r === Dr && (c = this.getNextRetryDelay({
        elapsedMs: a,
        retryCount: 0
      }), c === null)) {
        o(a);
        return;
      }
      this.log.debug("reconnecting in ".concat(c, "ms")), this.clearReconnectTimeout(), this.token && this.emit(P.TokenRefreshed, this.token);
      const d = z.setTimeout(() => this.attemptReconnect(s).finally(() => {
        this.reconnectTimeout === d && (this.reconnectTimeout = void 0);
      }), c);
      this.reconnectTimeout = d;
    }, this.waitForRestarted = (r) => new Promise((s) => {
      if (r.aborted) {
        s(!1);
        return;
      }
      const o = () => {
        r.removeEventListener("abort", a), s(!0);
      }, a = () => {
        r.removeEventListener("abort", a), this.off(P.Restarted, o), s(!1);
      };
      this.once(P.Restarted, o), r.addEventListener("abort", a);
    }), this.onRtpMapAvailable = (r) => {
      const s = /* @__PURE__ */ new Map();
      r.forEach((o) => {
        const a = o.codec.toLowerCase();
        ol(a) && s.set(o.payload, a);
      }), this.emit(P.RTPVideoMapUpdate, s);
    }, this.handleBrowserOnLine = () => m(this, void 0, void 0, function* () {
      !this.url || !(yield fetch(Qn(this.url), {
        method: "HEAD"
      }).then((s) => s.ok).catch(() => !1)) || (this.log.info("detected network reconnected"), // in case the engine is currently reconnecting, attempt a reconnect immediately after the browser state has changed to 'onLine'
      (this.client.currentState === we.RECONNECTING || // also if the browser went offline before and the engine still thinks it's in a connected state, treat it as a network interruption that we haven't noticed yet
      this.isWaitingForNetworkReconnect && this.client.currentState === we.CONNECTED) && (this.clearReconnectTimeout(), this.attemptReconnect(lt.RR_SIGNAL_DISCONNECTED), this.isWaitingForNetworkReconnect = !1));
    }), this.handleBrowserOffline = () => m(this, void 0, void 0, function* () {
      if (this.url)
        try {
          yield Promise.race([
            fetch(Qn(this.url), {
              method: "HEAD"
            }),
            // if there's no internet connection the fetch rejects immediately, so we only use a short timeout here
            be(4e3).then(() => Promise.reject())
          ]);
        } catch {
          window.navigator.onLine === !1 && (this.log.info("detected network interruption"), this.isWaitingForNetworkReconnect = !0);
        }
    }), this.log = pe((t = e.loggerName) !== null && t !== void 0 ? t : ne.Engine, () => this.logContext), this.loggerOptions = {
      loggerName: e.loggerName,
      loggerContextCb: () => this.logContext
    }, this.client = new ua(void 0, this.loggerOptions), this.client.signalLatency = this.options.expSignalLatency, this.reconnectPolicy = this.options.reconnectPolicy, this.closingLock = new fe(), this.dataProcessLock = new fe(), this.dataChannels = new Pm({
      isEngineClosed: () => this.isClosed,
      isReconnecting: () => this.attemptingReconnect,
      onDataMessage: (r) => this.handleDataMessage(r),
      onDataTrackMessage: (r) => this.handleDataTrackMessage(r),
      onDataError: (r) => this.handleDataError(r),
      onChannelClose: (r) => this.handleDataChannelClose(r)(),
      onBufferStatusChanged: (r, s) => this.emit(P.DCBufferStatusChanged, s, r)
    }), this.client.onParticipantUpdate = (r) => this.emit(P.ParticipantUpdate, r), this.client.onConnectionQuality = (r) => {
      this.handleLocalConnectionQuality(r), this.emit(P.ConnectionQualityUpdate, r);
    }, this.client.onRoomUpdate = (r) => this.emit(P.RoomUpdate, r), this.client.onSubscriptionError = (r) => this.emit(P.SubscriptionError, r), this.client.onSubscriptionPermissionUpdate = (r) => this.emit(P.SubscriptionPermissionUpdate, r), this.client.onSpeakersChanged = (r) => this.emit(P.SpeakersChanged, r), this.client.onStreamStateUpdate = (r) => this.emit(P.StreamStateChanged, r), this.client.onRequestResponse = (r) => this.emit(P.SignalRequestResponse, r), this.client.onParticipantUpdate = (r) => this.emit(P.ParticipantUpdate, r), this.client.onJoined = (r) => this.emit(P.Joined, r);
    const n = () => {
      for (const r of Array.from(this.pendingNegotiationAborts))
        r();
    };
    this.on(P.Closing, n), this.on(P.Restarting, n);
  }
  /** @internal */
  get logContext() {
    var e, t, n, r, s, o;
    return {
      room: (t = (e = this.latestJoinResponse) === null || e === void 0 ? void 0 : e.room) === null || t === void 0 ? void 0 : t.name,
      roomID: (r = (n = this.latestJoinResponse) === null || n === void 0 ? void 0 : n.room) === null || r === void 0 ? void 0 : r.sid,
      participant: (o = (s = this.latestJoinResponse) === null || s === void 0 ? void 0 : s.participant) === null || o === void 0 ? void 0 : o.identity,
      participantID: this.participantSid
    };
  }
  join(e, t, n, r) {
    return m(this, arguments, void 0, function(s, o, a, c) {
      var d = this;
      let l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !1;
      return (function* () {
        var u, h, f, g;
        d._isNewlyCreated = !1, d.url = s, d.token = o, d.signalOpts = a, d.maxJoinAttempts = a.maxRetries;
        try {
          d.joinAttempts += 1, d.joinStartedAt = performance.now(), d.setupSignalClientCallbacks();
          const p = !l && hp();
          let y;
          if (p) {
            d.pcManager || (yield d.configure(), d.applyInitialPublisherLayout(!0));
            const A = yield (u = d.pcManager) === null || u === void 0 ? void 0 : u.publisher.createInitialOffer();
            A && (y = Ft(A.offer, A.offerId));
          }
          if (c?.aborted)
            throw M.cancelled("Connection aborted");
          if (!l && d.shouldFailOnV1Path)
            throw d.shouldFailOnV1Path = !1, M.serviceNotFound("Simulated v1 path failure", "v0-rtc");
          const k = yield d.client.join(s, o, a, c, l, y);
          if (c?.aborted)
            throw d.log.info("join cancelled after the signal join response"), M.cancelled("Connection aborted");
          if (d._isClosed = !1, d.latestJoinResponse = k, d.participantSid = (h = k.participant) === null || h === void 0 ? void 0 : h.sid, d.subscriberPrimary = k.subscriberPrimary, p)
            (f = d.pcManager) === null || f === void 0 || f.updateConfiguration(d.makeRTCConfiguration(k)), d.dataChannels.publisherChannelsNegotiated && !d.useNegotiatedDataChannels() && (d.log.debug("server does not support negotiated data channels, using in-band ones"), d.createDataChannels(!1));
          else {
            if (!d.pcManager) {
              if (yield d.configure(k, !l), c?.aborted)
                throw d.log.info("join cancelled after configuring peer connections"), M.cancelled("Connection aborted");
              l || d.applyInitialPublisherLayout();
            }
            (!d.subscriberPrimary || k.fastPublish) && d.negotiate().catch((A) => {
              d.log.error(A);
            });
          }
          d.joinStartedAt !== void 0 && ((g = d.pcManager) === null || g === void 0 || g.publisher.setConnectionStartedAt(d.joinStartedAt)), d.registerOnLineListener(), d.clientConfiguration = k.clientConfiguration, d.emit(P.SignalConnected, k);
          let w = k.serverInfo;
          return w || (w = {
            version: k.serverVersion,
            region: k.serverRegion
          }), d.log.info("connected to Livekit Server ".concat(Object.entries(w).map((A) => {
            let b = L(A, 2), T = b[0], S = b[1];
            return "".concat(T, ": ").concat(S);
          }).join(", "))), {
            joinResponse: k,
            serverInfo: w
          };
        } catch (p) {
          if (p instanceof M) {
            if (p.reason === J.ServerUnreachable) {
              if (d.log.warn("Couldn't connect to server, attempt ".concat(d.joinAttempts, " of ").concat(d.maxJoinAttempts)), d.joinAttempts < d.maxJoinAttempts)
                return d.join(s, o, a, c, l);
            } else if (p.reason === J.ServiceNotFound)
              return d.log.warn("Initial connection failed: ".concat(p.message, " – Retrying")), d.pcManager && (d.pcManager.onStateChange = void 0, yield d.cleanupPeerConnections()), d.join(s, o, a, c, !0);
          }
          throw p;
        }
      })();
    });
  }
  /**
   * @param reason why the session is ending, recorded by the signal lifecycle. Worth passing
   * wherever the caller knows more than "someone called close" — the server's leave reason, or
   * having given up on reconnecting.
   */
  close(e) {
    return m(this, void 0, void 0, function* () {
      var t, n;
      (t = this.reconnectAbortController) === null || t === void 0 || t.abort(), this.reconnectAbortController = void 0, (n = this.restartAttemptController) === null || n === void 0 || n.abort(), this.restartAttemptController = void 0;
      const r = yield this.closingLock.lock();
      if (this.isClosed) {
        r();
        return;
      }
      try {
        this._isClosed = !0, this.joinAttempts = 0, this.joinStartedAt = void 0, this.emit(P.Closing), this.removeAllListeners(), this.deregisterOnLineListener(), this.clearPendingReconnect(), this.clearLostQualityTimeout(), this.cleanupLossyDataStats(), yield this.cleanupPeerConnections(), yield this.cleanupClient(e);
      } finally {
        r();
      }
    });
  }
  cleanupPeerConnections() {
    return m(this, void 0, void 0, function* () {
      var e;
      this.dataChannels.teardown(), yield (e = this.pcManager) === null || e === void 0 ? void 0 : e.close(), this.pcManager = void 0, this.transportConnectingSince = void 0, this.reliableReceivedState.clear();
    });
  }
  cleanupLossyDataStats() {
    this.lossyChannel.stopThresholdTuning();
  }
  cleanupClient(e) {
    return m(this, void 0, void 0, function* () {
      yield this.client.close(!0, e), this.client.resetCallbacks();
      for (const t of Object.keys(this.pendingTrackResolvers))
        this.pendingTrackResolvers[t].reject();
      this.pendingTrackResolvers = {};
    });
  }
  addTrack(e) {
    if (this.pendingTrackResolvers[e.cid])
      throw new st("a track with the same ID has already been published");
    return new Promise((t, n) => {
      const r = z.setTimeout(() => {
        delete this.pendingTrackResolvers[e.cid], n(M.timeout("publication of local track timed out, no response from server"));
      }, 1e4);
      this.pendingTrackResolvers[e.cid] = {
        resolve: (s) => {
          z.clearTimeout(r), t(s);
        },
        reject: () => {
          z.clearTimeout(r), n(new Error("Cancelled publication by calling unpublish"));
        }
      }, this.client.sendAddTrack(e);
    });
  }
  /**
   * Removes sender from PeerConnection, returning true if it was removed successfully
   * and a negotiation is necessary
   * @param sender
   * @returns
   */
  removeTrack(e) {
    if (e.track && this.pendingTrackResolvers[e.track.id]) {
      const t = this.pendingTrackResolvers[e.track.id].reject;
      t && t(), delete this.pendingTrackResolvers[e.track.id];
    }
    try {
      return this.pcManager.removeTrack(e), !0;
    } catch (t) {
      this.log.warn("failed to remove track", {
        error: t
      });
    }
    return !1;
  }
  updateMuteStatus(e, t) {
    this.client.sendMuteTrack(e, t);
  }
  get dataSubscriberReadyState() {
    var e;
    return (e = this.dataChannelForKind(j.RELIABLE, !0)) === null || e === void 0 ? void 0 : e.readyState;
  }
  getConnectedServerAddress() {
    return m(this, void 0, void 0, function* () {
      var e;
      return (e = this.pcManager) === null || e === void 0 ? void 0 : e.getConnectedAddress();
    });
  }
  /* @internal */
  setRegionStrategy(e) {
    this.regionStrategy = e;
  }
  configure(e, t) {
    return m(this, void 0, void 0, function* () {
      var n;
      if (!(this.pcManager && this.pcManager.currentState !== X.NEW)) {
        if (e) {
          this.participantSid = (n = e.participant) === null || n === void 0 ? void 0 : n.sid;
          const r = this.makeRTCConfiguration(e);
          this.pcManager = new Oo(t ? "publisher-only" : e.subscriberPrimary ? "subscriber-primary" : "publisher-primary", this.loggerOptions, {
            rtcConfig: r,
            peerConnectionTimeout: this.peerConnectionTimeout
          });
        } else {
          const r = this.makeRTCConfiguration();
          this.pcManager = new Oo("publisher-only", this.loggerOptions, {
            rtcConfig: r,
            peerConnectionTimeout: this.peerConnectionTimeout
          });
        }
        this.emit(P.TransportsCreated, this.pcManager.publisher, this.pcManager.subscriber), this.pcManager.onIceCandidate = (r, s) => {
          this.client.sendIceCandidate(r, s);
        }, this.pcManager.onPublisherOffer = (r, s) => {
          this.client.sendOffer(r, s);
        }, this.pcManager.onDataChannel = this.handleDataChannel, this.pcManager.onStateChange = (r, s, o) => m(this, void 0, void 0, function* () {
          var a;
          if (this.log.debug("primary PC state changed ".concat(r)), r === X.CONNECTING ? this.transportConnectingSince = Date.now() : this.transportConnectingSince = void 0, ["closed", "disconnected", "failed"].includes(s) && (this.publisherConnectionPromise = void 0), r === X.CONNECTED) {
            if (this.joinStartedAt !== void 0) {
              const u = Math.round(performance.now() - this.joinStartedAt);
              this.joinStartedAt = void 0, this.log.info("connection setup took ".concat(u, " ms")), (a = this.pcManager) === null || a === void 0 || a.publisher.setConnectionSetupTime(u);
            }
            const l = this.pcState === Be.New;
            this.pcState = Be.Connected, l && this.emit(P.Connected, this.latestJoinResponse);
          } else r === X.FAILED && (this.pcState === Be.Connected || this.pcState === Be.Reconnecting) && (this.pcState = Be.Disconnected, this.handleDisconnect("peerconnection failed", o === "failed" ? lt.RR_SUBSCRIBER_FAILED : lt.RR_PUBLISHER_FAILED));
          const c = this.client.isDisconnected || this.client.currentState === we.RECONNECTING, d = [X.FAILED, X.CLOSING, X.CLOSED].includes(r);
          c && d && !this._isClosed && this.emit(P.Offline);
        }), this.pcManager.onTrack = (r) => {
          r.streams.length !== 0 && this.emit(P.MediaTrackAdded, r.track, r.streams[0], r.receiver);
        };
      }
    });
  }
  setupSignalClientCallbacks() {
    this.client.onAnswer = (e, t, n) => m(this, void 0, void 0, function* () {
      if (this.pcManager) {
        if (this.pcManager.publisher.isStaleAnswer(t)) {
          this.log.warn("ignoring answer for old offer", {
            offerId: t,
            latestOfferId: this.pcManager.publisher.latestOfferId
          });
          return;
        }
        this.log.debug("received server answer", {
          RTCSdpType: e.type,
          sdp: e.sdp,
          midToTrackId: n
        }), this.pcManager.mode === "publisher-only" && Object.keys(n).length > 0 && (this.midToTrackId = n), yield this.pcManager.setPublisherAnswer(e, t), this.emit(P.RequestSubscribedCodecRefresh);
      }
    }), this.client.onTrickle = (e, t) => {
      this.pcManager && (this.log.debug("got ICE candidate from peer", {
        candidate: e,
        target: t
      }), this.pcManager.addIceCandidate(e, t));
    }, this.client.onOffer = (e, t, n) => m(this, void 0, void 0, function* () {
      if (this.latestRemoteOfferId = t, !this.pcManager)
        return;
      this.midToTrackId = n;
      const r = yield this.pcManager.createSubscriberAnswerFromOffer(e, t);
      r && this.client.sendAnswer(r, t);
    }), this.client.onLocalTrackPublished = (e) => {
      var t;
      if (this.log.debug("received trackPublishedResponse", {
        cid: e.cid,
        track: (t = e.track) === null || t === void 0 ? void 0 : t.sid
      }), !this.pendingTrackResolvers[e.cid]) {
        this.log.error("missing track resolver for ".concat(e.cid), {
          cid: e.cid
        });
        return;
      }
      const n = this.pendingTrackResolvers[e.cid].resolve;
      delete this.pendingTrackResolvers[e.cid], n(e.track);
    }, this.client.onLocalTrackUnpublished = (e) => {
      this.emit(P.LocalTrackUnpublished, e);
    }, this.client.onLocalTrackSubscribed = (e) => {
      this.emit(P.LocalTrackSubscribed, e);
    }, this.client.onTokenRefresh = (e) => {
      this.token = e, this.emit(P.TokenRefreshed, e);
    }, this.client.onRemoteMuteChanged = (e, t) => {
      this.emit(P.RemoteMute, e, t);
    }, this.client.onSubscribedQualityUpdate = (e) => {
      this.emit(P.SubscribedQualityUpdate, e);
    }, this.client.onRoomMoved = (e) => {
      var t;
      this.participantSid = (t = e.participant) === null || t === void 0 ? void 0 : t.sid, this.latestJoinResponse && (this.latestJoinResponse.room = e.room), this.emit(P.RoomMoved, e);
    }, this.client.onMediaSectionsRequirement = (e) => {
      this.addMediaSections(e.numAudios, e.numVideos), this.negotiate().catch((t) => {
        this.log.error(t);
      });
    }, this.client.onPublishDataTrackResponse = (e) => {
      this.emit(P.PublishDataTrackResponse, e);
    }, this.client.onUnPublishDataTrackResponse = (e) => {
      this.emit(P.UnPublishDataTrackResponse, e);
    }, this.client.onDataTrackSubscriberHandles = (e) => {
      this.emit(P.DataTrackSubscriberHandles, e);
    }, this.client.onClose = () => {
      this.handleDisconnect("signal", lt.RR_SIGNAL_DISCONNECTED);
    }, this.client.onLeave = (e) => {
      var t;
      switch (this.log.info("client leave request received (action=".concat(e?.action, ")"), {
        reason: e?.reason
      }), e.regions && (this.log.debug("updating regions"), this.emit(P.ServerRegionsReported, e.regions)), e.action) {
        case cn.DISCONNECT:
          this.emit(P.Disconnected, e?.reason), this.close("server leave: ".concat((t = Le[e.reason]) !== null && t !== void 0 ? t : e.reason));
          break;
        case cn.RECONNECT:
          this.fullReconnectOnNext = !0, this.handleDisconnect(Dr);
          break;
        case cn.RESUME:
          this.handleDisconnect(Dr);
      }
    };
  }
  makeRTCConfiguration(e) {
    var t;
    const n = Object.assign({}, this.rtcConfig);
    if ((!((t = this.signalOpts) === null || t === void 0) && t.e2eeEnabled || this.frameMetadataWorker && !Yn()) && ca() && (this.log.debug("E2EE - setting up transports with insertable streams"), n.encodedInsertableStreams = !0), n.sdpSemantics = "unified-plan", n.continualGatheringPolicy = "gather_continually", !e)
      return n;
    if (e.iceServers && !n.iceServers) {
      const s = [];
      e.iceServers.forEach((o) => {
        const a = {
          urls: o.urls
        };
        o.username && (a.username = o.username), o.credential && (a.credential = o.credential), s.push(a);
      }), n.iceServers = s;
    }
    return e.clientConfiguration && e.clientConfiguration.forceRelay === Kn.ENABLED && (n.iceTransportPolicy = "relay"), n;
  }
  /**
   * Populate the publisher PC so its first offer carries the data channels + recvonly media
   * sections. Required for every V1 connection: Firefox only binds receive decoders for media
   * present in that first offer, and the offer-with-join path needs the sections to
   * build a meaningful initial offer. Must be called on a configured pcManager.
   */
  applyInitialPublisherLayout(e) {
    this.createDataChannels(e), qe() || this.addMediaSections(xm, Mm);
  }
  addMediaSections(e, t) {
    var n, r, s;
    const o = {
      direction: "recvonly"
    };
    for (let c = 0; c < e; c++)
      (n = this.pcManager) === null || n === void 0 || n.addPublisherTransceiverOfKind("audio", o);
    const a = ((r = this.pcManager) === null || r === void 0 ? void 0 : r.mode) === "publisher-only";
    for (let c = 0; c < t; c++) {
      const d = (s = this.pcManager) === null || s === void 0 ? void 0 : s.addPublisherTransceiverOfKind("video", o);
      if (a && d) {
        const l = Vf(d);
        this.log.debug("dependency descriptor negotiated for received video", {
          negotiated: l
        });
      }
    }
  }
  /**
   * Whether to create the publisher data channels as negotiated (fixed SCTP stream IDs), which
   * lets the server send on them without waiting for our DCEP OPEN. Only in single peer
   * connection mode: with dual peer connections the server opens its own channels anyway.
   */
  useNegotiatedDataChannels() {
    var e, t, n, r;
    return ((e = this.pcManager) === null || e === void 0 ? void 0 : e.mode) === "publisher-only" && ((r = (n = (t = this.latestJoinResponse) === null || t === void 0 ? void 0 : t.serverInfo) === null || n === void 0 ? void 0 : n.protocol) !== null && r !== void 0 ? r : 0) >= $d;
  }
  createDataChannels() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : this.useNegotiatedDataChannels();
    this.pcManager && (this.dataChannels.hasPublisherChannels && (this.publisherConnectionPromise = void 0), this.dataChannels.createPublisherChannels(this.pcManager, e));
  }
  /** Normalizes an incoming data-channel message into bytes, or logs and returns undefined. */
  decodeDataMessage(e) {
    return m(this, void 0, void 0, function* () {
      if (e.data instanceof ArrayBuffer)
        return new Uint8Array(e.data);
      if (e.data instanceof Blob)
        return new Uint8Array(yield e.data.arrayBuffer());
      this.log.error("unsupported data type", {
        data: e.data
      });
    });
  }
  createSender(e, t, n) {
    return m(this, void 0, void 0, function* () {
      let r;
      if (ms())
        r = yield this.createTransceiverRTCRtpSender(e, t, n);
      else if (gs())
        this.log.warn("using add-track fallback"), r = yield this.createRTCRtpSender(e.mediaStreamTrack);
      else
        throw new $("Required webRTC APIs not supported on this device");
      return this.setupFrameMetadataSender(r, t), r;
    });
  }
  createSimulcastSender(e, t, n, r) {
    return m(this, void 0, void 0, function* () {
      let s;
      if (ms())
        s = yield this.createSimulcastTransceiverSender(e, t, n, r);
      else if (gs())
        this.log.debug("using add-track fallback"), s = yield this.createRTCRtpSender(e.mediaStreamTrack);
      else
        throw new $("Cannot stream on this device");
      return s && this.setupFrameMetadataSender(s, n), s;
    });
  }
  get frameMetadataWorker() {
    var e;
    return (e = this.frameMetadataOptions) === null || e === void 0 ? void 0 : e.worker;
  }
  setupFrameMetadataSender(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var n;
    const r = this.frameMetadataWorker;
    if (!r || !((n = this.signalOpts) === null || n === void 0) && n.e2eeEnabled)
      return;
    const s = da(t), o = Ui(s);
    if (Yn()) {
      o && (e.transform = new RTCRtpScriptTransform(r, {
        kind: "encode",
        packetTrailer: s
      }));
      return;
    }
    if (!Xn(this.frameMetadataOptions) || !("createEncodedStreams" in e)) {
      o && this.log.warn("frame metadata transform not supported; skipping write", this.logContext);
      return;
    }
    const a = e.createEncodedStreams(), c = a.readable, d = a.writable;
    o ? r.postMessage({
      kind: "encode",
      data: {
        readableStream: c,
        writableStream: d,
        packetTrailer: s
      }
    }, [c, d]) : c.pipeTo(d);
  }
  createTransceiverRTCRtpSender(e, t, n) {
    return m(this, void 0, void 0, function* () {
      if (!this.pcManager)
        throw new $("publisher is closed");
      const r = [];
      e.mediaStream && r.push(e.mediaStream), yt(e) && (e.codec = t.videoCodec);
      const s = {
        direction: "sendonly",
        streams: r
      };
      return n && (s.sendEncodings = n), (yield this.pcManager.addPublisherTransceiver(e.mediaStreamTrack, s)).sender;
    });
  }
  createSimulcastTransceiverSender(e, t, n, r) {
    return m(this, void 0, void 0, function* () {
      if (!this.pcManager)
        throw new $("publisher is closed");
      const s = {
        direction: "sendonly"
      };
      r && (s.sendEncodings = r);
      const o = yield this.pcManager.addPublisherTransceiver(t.mediaStreamTrack, s);
      if (n.videoCodec)
        return yield e.setSimulcastTrackSender(n.videoCodec, o.sender), o.sender;
    });
  }
  createRTCRtpSender(e) {
    return m(this, void 0, void 0, function* () {
      if (!this.pcManager)
        throw new $("publisher is closed");
      return this.pcManager.addPublisherTrack(e);
    });
  }
  /**
   * A sustained local `LOST` while connected and publishing means the server isn't receiving
   * our media, so force a full reconnect; any non-`LOST` value cancels a pending trigger.
   */
  handleLocalConnectionQuality(e) {
    if (!this.participantSid)
      return;
    const t = e.updates.find((n) => n.participantSid === this.participantSid);
    t && (t.quality === nn.LOST ? this.scheduleLostQualityReconnect() : this.clearLostQualityTimeout());
  }
  scheduleLostQualityReconnect() {
    this.lostQualityTimeout || (this.lostQualityTimeout = z.setTimeout(() => {
      this.lostQualityTimeout = void 0, !(this._isClosed || this.pcState !== Be.Connected || this.attemptingReconnect) && this.hasActivePublisherSenders() && (this.log.warn("local connection quality lost while publishing, triggering full reconnect", this.logContext), this.fullReconnectOnNext = !0, this.handleDisconnect("connection quality lost", lt.RR_PUBLISHER_FAILED));
    }, Im));
  }
  clearLostQualityTimeout() {
    this.lostQualityTimeout && (z.clearTimeout(this.lostQualityTimeout), this.lostQualityTimeout = void 0);
  }
  /** Whether the publisher currently has any sender with a live track. */
  hasActivePublisherSenders() {
    var e, t;
    return (t = (e = this.pcManager) === null || e === void 0 ? void 0 : e.publisher.getSenders().some((n) => !!n.track && n.track.readyState === "live")) !== null && t !== void 0 ? t : !1;
  }
  /**
   * Forces a full reconnect while keeping the engine (and its saved credentials) alive. Used by
   * Room's connection-reconcile safety net when the transport silently died but we looked connected.
   * @internal
   */
  reconnect() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : lt.RR_UNKNOWN;
    this.fullReconnectOnNext = !0, this.handleDisconnect("reconcile", e);
  }
  attemptReconnect(e) {
    return m(this, void 0, void 0, function* () {
      var t, n, r;
      if (this._isClosed)
        return;
      if (this.attemptingReconnect) {
        this.log.warn("already attempting reconnect, returning early");
        return;
      }
      this.clearLostQualityTimeout(), (((t = this.clientConfiguration) === null || t === void 0 ? void 0 : t.resumeConnection) === Kn.DISABLED || // signaling state could change to closed due to hardware sleep
      // those connections cannot be resumed
      ((r = (n = this.pcManager) === null || n === void 0 ? void 0 : n.currentState) !== null && r !== void 0 ? r : X.NEW) === X.NEW) && (this.fullReconnectOnNext = !0);
      const s = this.fullReconnectOnNext;
      this.fullReconnectOnNext = !1;
      let o = !1;
      const a = new AbortController();
      this.reconnectAbortController = a;
      try {
        if (this.attemptingReconnect = !0, s ? yield this.restartConnection(a.signal) : yield this.resumeConnection(e), a.signal.aborted) {
          this.log.info("reconnect attempt cancelled, not marking it as succeeded");
          return;
        }
        this.clearPendingReconnect(), o = !0;
      } catch (c) {
        if (a.signal.aborted) {
          this.log.info("reconnect attempt cancelled, not retrying", {
            error: c
          });
          return;
        }
        this.reconnectAttempts += 1;
        let d = !0;
        c instanceof $ ? (this.log.debug("received unrecoverable error", {
          error: c
        }), d = !1) : (s || !(c instanceof en)) && (this.fullReconnectOnNext = !0), d ? this.handleDisconnect("reconnect", lt.RR_UNKNOWN) : (this.log.info("could not recover connection after ".concat(this.reconnectAttempts, " attempts, ").concat(Date.now() - this.reconnectStart, "ms. giving up")), this.emit(P.Disconnected), yield this.close("gave up reconnecting after ".concat(this.reconnectAttempts, " attempts, ").concat(Date.now() - this.reconnectStart, "ms")));
      } finally {
        this.reconnectAbortController === a && (this.reconnectAbortController = void 0), this.attemptingReconnect = !1, o && this.fullReconnectOnNext && !this._isClosed && (this.log.debug("full reconnect requested during in-progress attempt, dispatching"), this.handleDisconnect("reconnect"));
      }
    });
  }
  getNextRetryDelay(e) {
    try {
      return this.reconnectPolicy.nextRetryDelayInMs(e);
    } catch (t) {
      this.log.warn("encountered error in reconnect policy", {
        error: t
      });
    }
    return null;
  }
  restartConnection(e, t) {
    return m(this, void 0, void 0, function* () {
      var n, r, s, o;
      try {
        if (e.aborted) {
          this.log.info("full reconnect cancelled before starting", {
            regionUrl: t
          });
          return;
        }
        if (!this.url || !this.token)
          throw new $("could not reconnect, url or token not saved");
        this.log.info("reconnecting, attempt: ".concat(this.reconnectAttempts)), (n = this.restartAttemptController) === null || n === void 0 || n.abort();
        const a = new AbortController();
        if (this.restartAttemptController = a, this.emit(P.Restarting), this.client.isDisconnected || (yield this.client.sendLeave()), yield this.cleanupPeerConnections(), yield this.cleanupClient(), e.aborted) {
          this.log.info("full reconnect cancelled after cleaning up the previous session", {
            regionUrl: t
          });
          return;
        }
        let c;
        try {
          if (!this.signalOpts)
            throw this.log.warn("attempted connection restart, without signal options present"), new en();
          c = (yield this.join(t ?? this.url, this.token, this.signalOpts, e, !this.options.singlePeerConnection)).joinResponse;
        } catch (d) {
          throw d instanceof M && d.reason === J.NotAllowed ? new $("could not reconnect, token might be expired") : new en();
        }
        if (e.aborted) {
          this.log.info("full reconnect cancelled after the signal join response", {
            regionUrl: t
          });
          return;
        }
        if (this.shouldFailNext)
          throw this.shouldFailNext = !1, new Error("simulated failure");
        if (this.client.setReconnected(), this.emit(P.SignalRestarted, c, a.signal), yield this.waitForPCReconnected(), e.aborted) {
          this.log.info("full reconnect cancelled after peer connections reconnected", {
            regionUrl: t
          });
          return;
        }
        if (this.client.currentState !== we.CONNECTED)
          throw new en("Signal connection got severed during reconnect");
        (r = this.regionStrategy) === null || r === void 0 || r.resetAttempts(), this.emit(P.Restarted);
      } catch (a) {
        if (e.aborted) {
          this.log.info("full reconnect cancelled after a failed attempt", {
            regionUrl: t
          });
          return;
        }
        const c = yield (s = this.regionStrategy) === null || s === void 0 ? void 0 : s.getNextUrl(e);
        if (e.aborted) {
          this.log.info("full reconnect cancelled during region selection", {
            regionUrl: t
          });
          return;
        }
        if (c) {
          yield this.restartConnection(e, c);
          return;
        } else
          throw (o = this.regionStrategy) === null || o === void 0 || o.resetAttempts(), a;
      }
    });
  }
  resumeConnection(e) {
    return m(this, void 0, void 0, function* () {
      if (!this.url || !this.token)
        throw new $("could not reconnect, url or token not saved");
      if (!this.pcManager)
        throw new $("publisher and subscriber connections unset");
      this.log.info("resuming signal connection, attempt ".concat(this.reconnectAttempts)), this.emit(P.Resuming);
      let t;
      try {
        this.setupSignalClientCallbacks(), t = yield this.client.reconnect(this.url, this.token, this.participantSid, e);
      } catch (r) {
        let s = "";
        throw r instanceof Error && (s = r.message, this.log.error(r.message, {
          error: r
        })), r instanceof M && r.reason === J.NotAllowed ? new $("could not reconnect, token might be expired") : r instanceof M && r.reason === J.LeaveRequest ? r : new en(s);
      }
      if (this.emit(P.SignalResumed), t) {
        const r = this.makeRTCConfiguration(t);
        this.pcManager.updateConfiguration(r), this.latestJoinResponse && (this.latestJoinResponse.serverInfo = t.serverInfo);
      } else
        this.log.warn("Did not receive reconnect response");
      if (this.shouldFailNext)
        throw this.shouldFailNext = !1, new Error("simulated failure");
      if (yield this.pcManager.triggerIceRestart(), yield this.waitForPCReconnected(), this.client.currentState !== we.CONNECTED)
        throw new en("Signal connection got severed during reconnect");
      this.client.setReconnected();
      const n = this.dataChannelForKind(j.RELIABLE);
      n?.readyState === "open" && n.id === null && this.createDataChannels(), t?.lastMessageSeq && this.resendReliableMessagesForResume(t.lastMessageSeq).catch((r) => {
        this.log.warn("failed to resend reliable messages after resume", Object.assign(Object.assign({}, this.logContext), {
          error: r
        }));
      }), this.emit(P.Resumed);
    });
  }
  waitForPCInitialConnection(e, t) {
    return m(this, void 0, void 0, function* () {
      if (!this.pcManager)
        throw new $("PC manager is closed");
      let n = !1;
      const r = () => {
        n = !0;
      };
      let s, o, a, c;
      const d = new Promise((l, u) => {
        s = l, o = () => u(M.internal("could not establish pc connection")), a = () => u(M.cancelled("room connection has been cancelled")), this.once(P.Restarted, s), this.once(P.Closing, o), t?.signal.addEventListener("abort", a), c = z.setTimeout(o, e ?? this.peerConnectionTimeout);
      });
      this.once(P.Restarting, r);
      try {
        yield Promise.race([this.pcManager.ensurePCTransportConnection(t, e), d]), n && (yield d);
      } finally {
        z.clearTimeout(c), t?.signal.removeEventListener("abort", a), this.off(P.Restarting, r), this.off(P.Restarted, s), this.off(P.Closing, o);
      }
    });
  }
  waitForPCReconnected() {
    return m(this, void 0, void 0, function* () {
      this.pcState = Be.Reconnecting, this.log.debug("waiting for peer connection to reconnect");
      try {
        if (yield be(Rm), !this.pcManager)
          throw new $("PC manager is closed");
        yield this.pcManager.ensurePCTransportConnection(void 0, this.peerConnectionTimeout), this.pcState = Be.Connected;
      } catch (e) {
        throw this.pcState = Be.Disconnected, M.internal("could not establish PC connection, ".concat(e.message));
      }
    });
  }
  /** @internal */
  publishRpcAck(e, t) {
    return m(this, void 0, void 0, function* () {
      const n = new Ae({
        destinationIdentities: [e],
        kind: It.RELIABLE,
        value: {
          case: "rpcAck",
          value: new Qi({
            requestId: t
          })
        }
      });
      yield this.sendDataPacket(n, j.RELIABLE);
    });
  }
  /* @internal */
  sendDataPacket(e, t) {
    return m(this, void 0, void 0, function* () {
      var n, r;
      if (yield this.ensurePublisherConnected(t), this.e2eeManager && this.e2eeManager.isDataChannelEncryptionEnabled) {
        const a = Cp(e);
        if (a) {
          const c = yield this.e2eeManager.encryptData(a.toBinary());
          e.value = {
            case: "encryptedPacket",
            value: new Sd({
              encryptedValue: c.payload,
              iv: c.iv,
              keyIndex: c.keyIndex
            })
          };
        }
      }
      t === j.RELIABLE && (e.sequence = this.reliableChannel.nextSequence());
      const s = e.toBinary(), o = Math.min((r = (n = this.pcManager) === null || n === void 0 ? void 0 : n.getMaxPublisherMessageSize()) !== null && r !== void 0 ? r : Bo, Bo);
      if (typeof o < "u" && o !== 0 && s.byteLength > o)
        throw new _f("cannot publish data packet larger than ".concat(o, " bytes (got ").concat(s.byteLength, ")"));
      t === j.RELIABLE ? yield this.reliableChannel.send(s, e.sequence) : yield this.lossyChannel.send(s);
    });
  }
  /**
   * Sends pre-serialized bytes on the data-track channel. This is the one send path that doesn't
   * go through {@link sendDataPacket} — Room's `packetAvailable` handler calls it directly with
   * bytes the data-track pipeline already serialized.
   *
   * @internal
   */
  sendDataTrackFrame(e) {
    return m(this, void 0, void 0, function* () {
      yield this.ensurePublisherConnected(j.DATA_TRACK_LOSSY), yield this.dataTrackChannel.send(e);
    });
  }
  resendReliableMessagesForResume(e) {
    return m(this, void 0, void 0, function* () {
      yield this.ensurePublisherConnected(j.RELIABLE), yield this.reliableChannel.replay(e);
    });
  }
  /** The flow-control gate for `kind` — see {@link FlowControlledDataChannel}. */
  flowControlFor(e) {
    return this.dataChannels.channelFor(e);
  }
  /**
   * Resolves once the caller may send on the `kind` channel — see
   * {@link FlowControlledDataChannel.waitForHeadroomWithLock}.
   */
  waitForBufferHeadroom(e) {
    return m(this, void 0, void 0, function* () {
      const t = this.dataChannelForKind(e);
      if (!t)
        throw new $("DataChannel not found, kind: ".concat(e));
      return this.flowControlFor(e).waitForHeadroomWithLock(t);
    });
  }
  /**
   * @internal
   */
  ensureDataTransportConnected(e) {
    return m(this, arguments, void 0, function(t) {
      var n = this;
      let r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : this.subscriberPrimary;
      return (function* () {
        var s;
        if (!n.pcManager)
          throw new $("PC manager is closed");
        const o = r ? n.pcManager.subscriber : n.pcManager.publisher, a = r ? "Subscriber" : "Publisher";
        if (!o)
          throw M.internal("".concat(a, " connection not set"));
        let c = !1;
        !r && !n.dataChannelForKind(t, r) && (n.createDataChannels(), c = !0), !c && !r && !n.pcManager.publisher.isICEConnected && n.pcManager.publisher.getICEConnectionState() !== "checking" && (c = !0), c && n.negotiate().catch((u) => {
          n.log.error(u);
        });
        const d = n.dataChannelForKind(t, r);
        if (d?.readyState === "open")
          return;
        const l = (/* @__PURE__ */ new Date()).getTime() + n.peerConnectionTimeout;
        for (; (/* @__PURE__ */ new Date()).getTime() < l; ) {
          if (o.isICEConnected && ((s = n.dataChannelForKind(t, r)) === null || s === void 0 ? void 0 : s.readyState) === "open")
            return;
          yield be(50);
        }
        throw M.internal("could not establish ".concat(a, " connection, state: ").concat(o.getICEConnectionState()));
      })();
    });
  }
  ensurePublisherConnected(e) {
    return m(this, void 0, void 0, function* () {
      this.publisherConnectionPromise || (this.publisherConnectionPromise = this.ensureDataTransportConnected(e, !1)), yield this.publisherConnectionPromise;
    });
  }
  /* @internal */
  verifyTransport() {
    if (!this.pcManager)
      return !1;
    const e = this.pcManager.currentState;
    return ![X.CONNECTING, X.CONNECTED].includes(e) || !this.client.ws || this.client.ws.readyState === WebSocket.CLOSED ? !1 : e === X.CONNECTING && this.transportConnectingSince !== void 0 && Date.now() - this.transportConnectingSince > this.peerConnectionTimeout ? (this.log.warn("transport stuck in connecting state", this.logContext), !1) : !0;
  }
  /** @internal */
  negotiate() {
    return m(this, void 0, void 0, function* () {
      return new Ee((e, t) => m(this, void 0, void 0, function* () {
        if (!this.pcManager) {
          t(new At("PC manager is closed"));
          return;
        }
        this.pcManager.requirePublisher(), this.pcManager.publisher.getTransceivers().length == 0 && !this.dataChannels.hasPublisherChannels && this.createDataChannels();
        const n = new AbortController(), r = () => {
          n.abort(), this.log.debug("engine disconnected while negotiation was ongoing"), e();
        };
        this.isClosed && t(new At("cannot negotiate on closed engine")), this.pendingNegotiationAborts.add(r), this.pcManager.publisher.off(_t.RTPVideoPayloadTypes, this.onRtpMapAvailable), this.pcManager.publisher.once(_t.RTPVideoPayloadTypes, this.onRtpMapAvailable);
        try {
          yield this.pcManager.negotiate(n), e();
        } catch (s) {
          if (n.signal.aborted) {
            e();
            return;
          }
          s instanceof At && (this.fullReconnectOnNext = !0), this.handleDisconnect("negotiation", lt.RR_UNKNOWN), s instanceof Error ? t(s) : t(new Error(String(s)));
        } finally {
          this.pendingNegotiationAborts.delete(r);
        }
      }));
    });
  }
  dataChannelForKind(e, t) {
    return this.dataChannels.getHandle(e, t);
  }
  /** @internal */
  sendSyncState(e, t, n) {
    var r, s, o, a;
    if (!this.pcManager) {
      this.log.warn("sync state cannot be sent without peer connection setup");
      return;
    }
    const c = this.pcManager.publisher.getLocalDescription(), d = this.pcManager.publisher.getRemoteDescription(), l = (r = this.pcManager.subscriber) === null || r === void 0 ? void 0 : r.getRemoteDescription(), u = (s = this.pcManager.subscriber) === null || s === void 0 ? void 0 : s.getLocalDescription(), h = (a = (o = this.signalOpts) === null || o === void 0 ? void 0 : o.autoSubscribe) !== null && a !== void 0 ? a : !0, f = new Array(), g = new Array();
    e.forEach((p) => {
      p.isDesired !== h && f.push(p.trackSid), p.isEnabled || g.push(p.trackSid);
    }), this.client.sendSyncState(new ia({
      answer: this.pcManager.mode === "publisher-only" ? d ? Ft({
        sdp: d.sdp,
        type: d.type
      }) : void 0 : u ? Ft({
        sdp: u.sdp,
        type: u.type
      }) : void 0,
      offer: this.pcManager.mode === "publisher-only" ? c ? Ft({
        sdp: c.sdp,
        type: c.type
      }) : void 0 : l ? Ft({
        sdp: l.sdp,
        type: l.type
      }) : void 0,
      subscription: new er({
        trackSids: f,
        subscribe: !h,
        participantTracks: []
      }),
      publishTracks: Mf(t),
      dataChannels: this.dataChannelsInfo(),
      trackSidsDisabled: g,
      datachannelReceiveStates: this.reliableReceivedState.map((p, y) => new Wd({
        publisherSid: y,
        lastSeq: p
      })),
      publishDataTracks: n
    }));
  }
  /* @internal */
  failNext() {
    this.shouldFailNext = !0;
  }
  /* @internal */
  failNextV1Path() {
    this.shouldFailOnV1Path = !0;
  }
  dataChannelsInfo() {
    const e = [], t = (n, r) => {
      n?.id !== void 0 && n.id !== null && e.push(new Hd({
        label: n.label,
        id: n.id,
        target: r
      }));
    };
    return t(this.dataChannelForKind(j.LOSSY), Oe.PUBLISHER), t(this.dataChannelForKind(j.RELIABLE), Oe.PUBLISHER), t(this.dataChannelForKind(j.LOSSY, !0), Oe.SUBSCRIBER), t(this.dataChannelForKind(j.RELIABLE, !0), Oe.SUBSCRIBER), t(this.dataChannelForKind(j.DATA_TRACK_LOSSY), Oe.PUBLISHER), t(this.dataChannelForKind(j.DATA_TRACK_LOSSY, !0), Oe.SUBSCRIBER), e;
  }
  clearReconnectTimeout() {
    this.reconnectTimeout && (z.clearTimeout(this.reconnectTimeout), this.reconnectTimeout = void 0);
  }
  clearPendingReconnect() {
    this.clearReconnectTimeout(), this.reconnectAttempts = 0;
  }
  registerOnLineListener() {
    _e() && (window.addEventListener("online", this.handleBrowserOnLine), window.addEventListener("offline", this.handleBrowserOffline));
  }
  deregisterOnLineListener() {
    _e() && (window.removeEventListener("online", this.handleBrowserOnLine), window.removeEventListener("offline", this.handleBrowserOffline));
  }
  getTrackIdForReceiver(e) {
    var t, n;
    const r = (n = (t = this.pcManager) === null || t === void 0 ? void 0 : t.getTransceiverForReceiver(e)) === null || n === void 0 ? void 0 : n.mid;
    if (r) {
      const s = Object.entries(this.midToTrackId).find((o) => L(o, 1)[0] === r);
      if (s)
        return s[1];
    }
  }
}
function jo(i, e) {
  const t = i.participantIdentity ? i.participantIdentity : e.participantIdentity;
  i.participantIdentity = t, e.participantIdentity = t;
  const n = i.destinationIdentities.length !== 0 ? i.destinationIdentities : e.destinationIdentities;
  i.destinationIdentities = n, e.destinationIdentities = n;
}
const pi = /* @__PURE__ */ pe(ne.Region), Es = 5e3, Lm = 3e4;
class W {
  static fetchRegionSettings(e, t, n) {
    return m(this, void 0, void 0, function* () {
      const r = yield W.fetchLock.lock();
      try {
        const s = yield fetch("".concat(Dm(e), "/regions"), {
          headers: {
            authorization: "Bearer ".concat(t)
          },
          signal: n
        });
        if (s.ok) {
          const o = lp(s.headers), a = o ? o * 1e3 : Es;
          return {
            regionSettings: yield s.json(),
            updatedAtInMs: Date.now(),
            maxAgeInMs: a
          };
        } else
          throw s.status === 401 ? M.notAllowed("Could not fetch region settings: ".concat(s.statusText), s.status) : M.internal("Could not fetch region settings: ".concat(s.statusText));
      } catch (s) {
        throw s instanceof M ? s : n?.aborted ? M.cancelled("Region fetching was aborted") : M.serverUnreachable("Could not fetch region settings, ".concat(s instanceof Error ? "".concat(s.name, ": ").concat(s.message) : s));
      } finally {
        r();
      }
    });
  }
  static scheduleRefetch(e, t, n) {
    return m(this, void 0, void 0, function* () {
      const r = W.settingsTimeouts.get(e.hostname);
      clearTimeout(r), W.settingsTimeouts.set(e.hostname, setTimeout(() => m(this, void 0, void 0, function* () {
        try {
          const s = yield W.fetchRegionSettings(e, t);
          W.updateCachedRegionSettings(e, t, s);
        } catch (s) {
          if (s instanceof M && s.reason === J.NotAllowed) {
            pi.debug("token is not valid, cancelling auto region refresh");
            return;
          }
          pi.debug("auto refetching of region settings failed", {
            error: s
          }), W.scheduleRefetch(e, t, n);
        }
      }), n));
    });
  }
  static updateCachedRegionSettings(e, t, n) {
    W.cache.set(e.hostname, n), W.scheduleRefetch(e, t, n.maxAgeInMs);
  }
  static stopRefetch(e) {
    const t = W.settingsTimeouts.get(e);
    t && (clearTimeout(t), W.settingsTimeouts.delete(e));
  }
  static scheduleCleanup(e) {
    let t = W.connectionTrackers.get(e);
    t && (t.cleanupTimeout && clearTimeout(t.cleanupTimeout), t.cleanupTimeout = setTimeout(() => {
      const n = W.connectionTrackers.get(e);
      n && n.connectionCount === 0 && (pi.debug("stopping region refetch after disconnect delay", {
        hostname: e
      }), W.stopRefetch(e)), n && (n.cleanupTimeout = void 0);
    }, Lm));
  }
  static cancelCleanup(e) {
    const t = W.connectionTrackers.get(e);
    t?.cleanupTimeout && (clearTimeout(t.cleanupTimeout), t.cleanupTimeout = void 0);
  }
  notifyConnected() {
    const e = this.serverUrl.hostname;
    let t = W.connectionTrackers.get(e);
    t || (t = {
      connectionCount: 0
    }, W.connectionTrackers.set(e, t)), t.connectionCount++, W.cancelCleanup(e);
  }
  notifyDisconnected() {
    const e = this.serverUrl.hostname, t = W.connectionTrackers.get(e);
    t && (t.connectionCount = Math.max(0, t.connectionCount - 1), t.connectionCount === 0 && W.scheduleCleanup(e));
  }
  constructor(e, t) {
    this.attemptedRegions = [], this.serverUrl = new URL(e), this.token = t;
  }
  updateToken(e) {
    var t;
    this.token = e;
    const n = this.getServerUrl(), r = W.cache.get(n.hostname);
    W.scheduleRefetch(this.serverUrl, this.token, (t = r?.maxAgeInMs) !== null && t !== void 0 ? t : Es);
  }
  isCloud() {
    return Sn(this.serverUrl);
  }
  getServerUrl() {
    return this.serverUrl;
  }
  /** @internal */
  fetchRegionSettings(e) {
    return m(this, void 0, void 0, function* () {
      return W.fetchRegionSettings(this.serverUrl, this.token, e);
    });
  }
  getNextBestRegionUrl(e) {
    return m(this, void 0, void 0, function* () {
      if (!this.isCloud())
        throw Error("region availability is only supported for LiveKit Cloud domains");
      let t = W.cache.get(this.serverUrl.hostname);
      (!t || Date.now() - t.updatedAtInMs > t.maxAgeInMs) && (t = yield this.fetchRegionSettings(e), W.updateCachedRegionSettings(this.serverUrl, this.token, t));
      const n = t.regionSettings.regions.filter((r) => !this.attemptedRegions.find((s) => s.url === r.url));
      if (n.length > 0) {
        const r = n[0];
        return this.attemptedRegions.push(r), pi.info("switching to region: ".concat(r.region), {
          region: r.region
        }), r.url;
      } else
        return null;
    });
  }
  resetAttempts() {
    this.attemptedRegions = [];
  }
  setServerReportedRegions(e) {
    W.updateCachedRegionSettings(this.serverUrl, this.token, e);
  }
}
W.cache = /* @__PURE__ */ new Map();
W.settingsTimeouts = /* @__PURE__ */ new Map();
W.connectionTrackers = /* @__PURE__ */ new Map();
W.fetchLock = new fe();
function Dm(i) {
  return "".concat(i.protocol.replace("ws", "http"), "//").concat(i.host, "/settings");
}
const Nm = ["e2eeManager", "frameMetadataOptions", "byteStreamOpener", "videoPublisher"];
function ga(i, e, t) {
  const n = Symbol("lk.extension.".concat(i)), r = (s) => ({
    key: n,
    requires: e,
    install: (o, a) => t(o, a, typeof s == "function" ? s() : s)
  });
  return Object.assign((s) => r(s), r());
}
function bl(i, e) {
  const t = /* @__PURE__ */ new Map();
  for (const o of e) {
    if (t.has(o.key))
      throw new Error("extension '".concat(String(o.key), "' is listed twice"));
    t.set(o.key, o);
  }
  const n = [], r = /* @__PURE__ */ new Set(), s = (o, a) => {
    var c, d;
    const l = (c = t.get(o.key)) !== null && c !== void 0 ? c : o;
    if (a.includes(l.key))
      throw new Error("extension '".concat(String(l.key), "' depends on itself"));
    r.has(l.key) || (r.add(l.key), (d = l.requires) === null || d === void 0 || d.forEach((u) => s(u, [...a, l.key])), n.push(l));
  };
  e.forEach((o) => s(o, [])), i.installExtensions(n);
}
const va = 2e3;
function rr(i, e) {
  if (!e)
    return 0;
  let t, n;
  return "bytesReceived" in i ? (t = i.bytesReceived, n = e.bytesReceived) : "bytesSent" in i && (t = i.bytesSent, n = e.bytesSent), t === void 0 || n === void 0 || i.timestamp === void 0 || e.timestamp === void 0 ? 0 : (t - n) * 8 * 1e3 / (i.timestamp - e.timestamp);
}
const ba = typeof MediaRecorder < "u";
class Um {
  constructor() {
    throw new Error("MediaRecorder is not available in this environment");
  }
}
const Fm = ba ? MediaRecorder : Um;
class Bm extends Fm {
  constructor(e, t) {
    if (!ba)
      throw new Error("MediaRecorder is not available in this environment");
    super(new MediaStream([e.mediaStreamTrack]), t);
    let n, r;
    const s = () => r === void 0, o = () => {
      this.removeEventListener("dataavailable", n), this.removeEventListener("stop", o), this.removeEventListener("error", a), r?.close(), r = void 0;
    }, a = (c) => {
      r?.error(c), this.removeEventListener("dataavailable", n), this.removeEventListener("stop", o), this.removeEventListener("error", a), r = void 0;
    };
    this.byteStream = new ReadableStream({
      start: (c) => {
        r = c, n = (d) => m(this, void 0, void 0, function* () {
          let l;
          if (d.data.arrayBuffer) {
            const u = yield d.data.arrayBuffer();
            l = new Uint8Array(u);
          } else if (d.data.byteArray)
            l = d.data.byteArray;
          else
            throw new Error("no data available!");
          s() || c.enqueue(l);
        }), this.addEventListener("dataavailable", n);
      },
      cancel: () => {
        o();
      }
    }), this.addEventListener("stop", o), this.addEventListener("error", a);
  }
}
function jm() {
  return ba;
}
const qm = 1e3, Vm = 1e4;
class yl extends C {
  /** @internal */
  get sender() {
    return this._sender;
  }
  /** @internal */
  set sender(e) {
    this._sender = e;
  }
  get constraints() {
    return this._constraints;
  }
  get hasPreConnectBuffer() {
    return !!this.localTrackRecorder;
  }
  /**
   *
   * @param mediaTrack
   * @param kind
   * @param constraints MediaTrackConstraints that are being used when restarting or reacquiring tracks
   * @param userProvidedTrack Signals to the SDK whether or not the mediaTrack should be managed (i.e. released and reacquired) internally by the SDK
   */
  constructor(e, t, n) {
    let r = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1, s = arguments.length > 4 ? arguments[4] : void 0;
    super(e, t, s), this.manuallyStopped = !1, this.pendingDeviceChange = !1, this._isUpstreamPaused = !1, this.handleTrackMuteEvent = () => this.debouncedTrackMuteHandler().catch(() => this.log.debug("track mute bounce got cancelled by an unmute event", this.logContext)), this.debouncedTrackMuteHandler = fa(() => m(this, void 0, void 0, function* () {
      yield this.pauseUpstream();
    }), 5e3), this.handleTrackUnmuteEvent = () => m(this, void 0, void 0, function* () {
      this.debouncedTrackMuteHandler.cancel("unmute"), yield this.resumeUpstream();
    }), this.handleEnded = () => {
      this.isInBackground && (this.reacquireTrack = !0), this._mediaStreamTrack.removeEventListener("mute", this.handleTrackMuteEvent), this._mediaStreamTrack.removeEventListener("unmute", this.handleTrackUnmuteEvent), this.emit(R.Ended, this);
    }, this.reacquireTrack = !1, this.providedByUser = r, this.muteLock = new fe(), this.pauseUpstreamLock = new fe(), this.trackChangeLock = new fe(), this.trackChangeLock.lock().then((o) => m(this, void 0, void 0, function* () {
      try {
        yield this.setMediaStreamTrack(e, !0);
      } finally {
        o();
      }
    })), this._constraints = e.getConstraints(), n && (this._constraints = n);
  }
  get id() {
    return this._mediaStreamTrack.id;
  }
  get dimensions() {
    if (this.kind !== C.Kind.Video)
      return;
    const e = this._mediaStreamTrack.getSettings(), t = e.width, n = e.height;
    if (t && n)
      return {
        width: t,
        height: n
      };
  }
  get isUpstreamPaused() {
    return this._isUpstreamPaused;
  }
  get isUserProvided() {
    return this.providedByUser;
  }
  get isStopped() {
    return this.manuallyStopped;
  }
  get mediaStreamTrack() {
    var e, t;
    return (t = (e = this.processor) === null || e === void 0 ? void 0 : e.processedTrack) !== null && t !== void 0 ? t : this._mediaStreamTrack;
  }
  get isLocal() {
    return !0;
  }
  /**
   * @internal
   * returns mediaStreamTrack settings of the capturing mediastreamtrack source - ignoring processors
   */
  getSourceTrackSettings() {
    return this._mediaStreamTrack.getSettings();
  }
  setMediaStreamTrack(e, t, n) {
    return m(this, void 0, void 0, function* () {
      var r;
      if (e === this._mediaStreamTrack && !t)
        return;
      this._mediaStreamTrack && (this.attachedElements.forEach((o) => {
        dn(this._mediaStreamTrack, o);
      }), this.debouncedTrackMuteHandler.cancel("new-track"), this._mediaStreamTrack.removeEventListener("ended", this.handleEnded), this._mediaStreamTrack.removeEventListener("mute", this.handleTrackMuteEvent), this._mediaStreamTrack.removeEventListener("unmute", this.handleTrackUnmuteEvent)), this.mediaStream = new MediaStream([e]), e && (e.addEventListener("ended", this.handleEnded), e.addEventListener("mute", this.handleTrackMuteEvent), e.addEventListener("unmute", this.handleTrackUnmuteEvent), this._constraints = e.getConstraints());
      let s;
      if (this.processor && e) {
        if (this.log.debug("restarting processor", this.logContext), this.kind === "unknown")
          throw TypeError("cannot set processor on track of unknown kind");
        this.processorElement && (sn(e, this.processorElement), this.processorElement.muted = !0), yield this.processor.restart({
          track: e,
          kind: this.kind,
          element: this.processorElement,
          // audio processors need the context they were initialised with in order to rebuild
          // their graph, omitting it here would leave them without one
          audioContext: this.audioContext,
          localTrack: this
        }), s = this.processor.processedTrack;
      }
      this.sender && ((r = this.sender.transport) === null || r === void 0 ? void 0 : r.state) !== "closed" && (yield this.sender.replaceTrack(s ?? e)), !this.providedByUser && this._mediaStreamTrack !== e && this._mediaStreamTrack.stop(), this._mediaStreamTrack = e, e && (this._mediaStreamTrack.enabled = n ? !0 : !this.isMuted, yield this.resumeUpstream(), this.attachedElements.forEach((o) => {
        sn(s ?? e, o);
      })), yield this.onMediaStreamTrackChanged();
    });
  }
  /**
   * Hook invoked after the underlying MediaStreamTrack has been swapped and the processor has
   * been restarted around it, so `processor.processedTrack` already holds the new track.
   * Unlike `onSenderTrackSwapped` this also fires on the restart and unmute paths.
   */
  onMediaStreamTrackChanged() {
    return m(this, void 0, void 0, function* () {
    });
  }
  waitForDimensions() {
    return m(this, arguments, void 0, function() {
      var e = this;
      let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : qm;
      return (function* () {
        if (e.kind === C.Kind.Audio)
          throw new Error("cannot get dimensions for audio tracks");
        const n = Date.now();
        for ((Gf() || ir() && e.source === C.Source.ScreenShare) && (yield Uf(e._mediaStreamTrack, t, e.attachedElements)); ; ) {
          const r = e.dimensions;
          if (r)
            return r;
          if (Date.now() - n >= t)
            break;
          yield be(50);
        }
        throw new st("unable to get track dimensions after timeout");
      })();
    });
  }
  setDeviceId(e) {
    return m(this, void 0, void 0, function* () {
      return this._constraints.deviceId === e && this._mediaStreamTrack.getSettings().deviceId === hn(e) && this._mediaStreamTrack.readyState === "live" ? !0 : (this._constraints.deviceId = e, this.isMuted ? (this.pendingDeviceChange = !0, !0) : (yield this.restartTrack(), hn(e) === this._mediaStreamTrack.getSettings().deviceId));
    });
  }
  /**
   * @returns DeviceID of the device that is currently being used for this track
   */
  getDeviceId() {
    return m(this, arguments, void 0, function() {
      var e = this;
      let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0;
      return (function* () {
        if (e.source === C.Source.ScreenShare)
          return;
        const n = e._mediaStreamTrack.getSettings(), r = n.deviceId, s = n.groupId, o = e.kind === C.Kind.Audio ? "audioinput" : "videoinput";
        return t ? he.getInstance().normalizeDeviceId(o, r, s) : r;
      })();
    });
  }
  mute() {
    return m(this, void 0, void 0, function* () {
      return this.setTrackMuted(!0), this;
    });
  }
  unmute() {
    return m(this, void 0, void 0, function* () {
      return this.setTrackMuted(!1), this;
    });
  }
  replaceTrack(e, t) {
    return m(this, void 0, void 0, function* () {
      const n = yield this.trackChangeLock.lock();
      try {
        if (!this.sender)
          throw new st("unable to replace an unpublished track");
        let r, s;
        typeof t == "boolean" ? r = t : t !== void 0 && (r = t.userProvidedTrack, s = t.stopProcessor), this.providedByUser = r ?? !0, this.log.debug("replace MediaStreamTrack", this.logContext), yield this.setMediaStreamTrack(e), s && this.processor && (yield this.internalStopProcessor());
      } finally {
        n();
      }
      return yield this.onSenderTrackSwapped(), this;
    });
  }
  /**
   * Hook invoked after the MediaStreamTrack on the sender has been swapped
   * (via replaceTrack, setProcessor, or stopProcessor). Fires outside the
   * trackChangeLock so subclasses can do asynchronous work such as polling
   * for new dimensions without blocking other track operations.
   */
  onSenderTrackSwapped() {
    return m(this, void 0, void 0, function* () {
    });
  }
  restart(e, t) {
    return m(this, void 0, void 0, function* () {
      this.manuallyStopped = !1;
      const n = yield this.trackChangeLock.lock();
      try {
        e || (e = this._constraints);
        const r = e, s = r.deviceId, o = r.facingMode, a = mf(e, ["deviceId", "facingMode"]);
        this.log.debug("restarting track with constraints", Object.assign(Object.assign({}, this.logContext), {
          constraints: e
        }));
        const c = {
          audio: !1,
          video: !1
        };
        this.kind === C.Kind.Video ? c.video = s || o ? {
          deviceId: s,
          facingMode: o
        } : !0 : c.audio = s ? Object.assign({
          deviceId: s
        }, a) : !0, this.attachedElements.forEach((u) => {
          dn(this.mediaStreamTrack, u);
        }), this._mediaStreamTrack.removeEventListener("ended", this.handleEnded), this._mediaStreamTrack.stop();
        let d;
        try {
          d = yield navigator.mediaDevices.getUserMedia(c);
        } catch (u) {
          throw tp(u), u;
        }
        const l = d.getTracks()[0];
        try {
          this.kind === C.Kind.Video && (yield l.applyConstraints(a)), l.addEventListener("ended", this.handleEnded), this.log.debug("re-acquired MediaStreamTrack", this.logContext), yield this.setMediaStreamTrack(l, !1, t);
        } catch (u) {
          throw this._mediaStreamTrack !== l && l.stop(), u;
        }
        return this._constraints = e, this.pendingDeviceChange = !1, this.emit(R.Restarted, this), this;
      } finally {
        this.manuallyStopped && (this.log.warn("track was stopped during a restart, stopping restarted track", this.logContext), this.stop()), n();
      }
    });
  }
  setTrackMuted(e) {
    this.log.debug("setting ".concat(this.kind, " track ").concat(e ? "muted" : "unmuted"), this.logContext), !(this.isMuted === e && this._mediaStreamTrack.enabled !== e) && (this.isMuted = e, this._mediaStreamTrack.enabled = !e, this.emit(e ? R.Muted : R.Unmuted, this));
  }
  get needsReAcquisition() {
    return this._mediaStreamTrack.readyState !== "live" || this._mediaStreamTrack.muted || !this._mediaStreamTrack.enabled || this.reacquireTrack;
  }
  handleAppVisibilityChanged() {
    const e = Object.create(null, {
      handleAppVisibilityChanged: {
        get: () => super.handleAppVisibilityChanged
      }
    });
    return m(this, void 0, void 0, function* () {
      yield e.handleAppVisibilityChanged.call(this), il() && (this.log.debug("visibility changed, is in Background: ".concat(this.isInBackground), this.logContext), !this.isInBackground && this.needsReAcquisition && !this.isUserProvided && !this.isMuted && (this.log.debug("track needs to be reacquired, restarting ".concat(this.source), this.logContext), yield this.restart(), this.reacquireTrack = !1));
    });
  }
  stop() {
    var e;
    this.manuallyStopped = !0, super.stop(), this._mediaStreamTrack.removeEventListener("ended", this.handleEnded), this._mediaStreamTrack.removeEventListener("mute", this.handleTrackMuteEvent), this._mediaStreamTrack.removeEventListener("unmute", this.handleTrackUnmuteEvent), (e = this.processor) === null || e === void 0 || e.destroy().catch((t) => {
      this.log.error("failed to destroy processor", Object.assign(Object.assign({}, this.logContext), {
        error: t
      }));
    }), this.processor = void 0;
  }
  /**
   * pauses publishing to the server without disabling the local MediaStreamTrack
   * this is used to display a user's own video locally while pausing publishing to
   * the server.
   * this API is unsupported on Safari < 12 due to a bug
   **/
  pauseUpstream() {
    return m(this, void 0, void 0, function* () {
      var e;
      const t = yield this.pauseUpstreamLock.lock();
      try {
        if (this._isUpstreamPaused === !0)
          return;
        if (!this.sender) {
          this.log.warn("unable to pause upstream for an unpublished track", this.logContext);
          return;
        }
        this._isUpstreamPaused = !0, this.emit(R.UpstreamPaused, this);
        const n = ke();
        if (n?.name === "Safari" && Ye(n.version, "12.0") < 0)
          throw new sa("pauseUpstream is not supported on Safari < 12.");
        ((e = this.sender.transport) === null || e === void 0 ? void 0 : e.state) !== "closed" && (yield this.sender.replaceTrack(null));
      } finally {
        t();
      }
    });
  }
  resumeUpstream() {
    return m(this, void 0, void 0, function* () {
      var e;
      const t = yield this.pauseUpstreamLock.lock();
      try {
        if (this._isUpstreamPaused === !1)
          return;
        if (!this.sender) {
          this.log.warn("unable to resume upstream for an unpublished track", this.logContext);
          return;
        }
        this._isUpstreamPaused = !1, this.emit(R.UpstreamResumed, this), ((e = this.sender.transport) === null || e === void 0 ? void 0 : e.state) !== "closed" && (yield this.sender.replaceTrack(this.mediaStreamTrack));
      } finally {
        t();
      }
    });
  }
  /**
   * Gets the RTCStatsReport for the LocalTrack's underlying RTCRtpSender
   * See https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport
   *
   * @returns Promise<RTCStatsReport> | undefined
   */
  getRTCStatsReport() {
    return m(this, void 0, void 0, function* () {
      var e;
      return !((e = this.sender) === null || e === void 0) && e.getStats ? yield this.sender.getStats() : void 0;
    });
  }
  /**
   * Sets a processor on this track.
   * See https://github.com/livekit/track-processors-js for example usage
   *
   * The processor lives on the track, so stopping the track destroys it. Unpublishing and
   * disconnecting both stop the track by default, which means a processor has to be set again on
   * the track published after a reconnect. See {@link TrackProcessor} for the full lifecycle,
   * including what `stopLocalTrackOnUnpublish: false` changes.
   *
   * @param processor
   * @param showProcessedStreamLocally
   * @returns
   */
  setProcessor(e) {
    return m(this, arguments, void 0, function(t) {
      var n = this;
      let r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
      return (function* () {
        var s;
        const o = yield n.trackChangeLock.lock();
        try {
          n.log.debug("setting up processor", n.logContext);
          const a = document.createElement(n.kind), c = {
            kind: n.kind,
            track: n._mediaStreamTrack,
            element: a,
            audioContext: n.audioContext,
            localTrack: n
          };
          if (yield t.init(c), n.log.debug("processor initialized", n.logContext), n.processor && (yield n.internalStopProcessor()), n.kind === "unknown")
            throw TypeError("cannot set processor on track of unknown kind");
          if (sn(n._mediaStreamTrack, a), a.muted = !0, a.play().catch((d) => {
            d instanceof DOMException && d.name === "AbortError" ? (n.log.warn("failed to play processor element, retrying", Object.assign(Object.assign({}, n.logContext), {
              error: d
            })), setTimeout(() => {
              a.play().catch((l) => {
                n.log.error("failed to play processor element", Object.assign(Object.assign({}, n.logContext), {
                  err: l
                }));
              });
            }, 100)) : n.log.error("failed to play processor element", Object.assign(Object.assign({}, n.logContext), {
              error: d
            }));
          }), n.processor = t, n.processorElement = a, n.processor.processedTrack) {
            for (const d of n.attachedElements)
              d !== n.processorElement && r && (dn(n._mediaStreamTrack, d), sn(n.processor.processedTrack, d));
            yield (s = n.sender) === null || s === void 0 ? void 0 : s.replaceTrack(n.processor.processedTrack);
          }
          n.emit(R.TrackProcessorUpdate, n.processor);
        } finally {
          o();
        }
        yield n.onSenderTrackSwapped();
      })();
    });
  }
  /**
   * Returns the processor currently set on this track, or `undefined` if there is none. A track
   * that was stopped by an unpublish or a disconnect has none. See {@link TrackProcessor}.
   */
  getProcessor() {
    return this.processor;
  }
  /**
   * Stops the track processor
   * See https://github.com/livekit/track-processors-js for example usage
   *
   * Only needed to remove a processor from a track that stays published. Unpublishing or
   * disconnecting already destroys it. See {@link TrackProcessor}.
   */
  stopProcessor() {
    return m(this, arguments, void 0, function() {
      var e = this;
      let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0;
      return (function* () {
        const n = yield e.trackChangeLock.lock();
        try {
          yield e.internalStopProcessor(t);
        } finally {
          n();
        }
        yield e.onSenderTrackSwapped();
      })();
    });
  }
  /**
   * @internal
   * This method assumes the caller has acquired a trackChangeLock already.
   * The public facing method for stopping the processor is `stopProcessor` and it wraps this method in the trackChangeLock.
   */
  internalStopProcessor() {
    return m(this, arguments, void 0, function() {
      var e = this;
      let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0;
      return (function* () {
        var n, r;
        e.processor && (e.log.debug("stopping processor", e.logContext), (n = e.processor.processedTrack) === null || n === void 0 || n.stop(), yield e.processor.destroy(), e.processor = void 0, t || ((r = e.processorElement) === null || r === void 0 || r.remove(), e.processorElement = void 0), yield e._mediaStreamTrack.applyConstraints(e._constraints), yield e.setMediaStreamTrack(e._mediaStreamTrack, !0), e.emit(R.TrackProcessorUpdate));
      })();
    });
  }
  /** @internal */
  startPreConnectBuffer() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 100;
    if (!jm()) {
      this.log.warn("MediaRecorder is not available, cannot start preconnect buffer", this.logContext);
      return;
    }
    if (this.localTrackRecorder) {
      this.log.warn("preconnect buffer already started");
      return;
    } else {
      let t = "audio/webm;codecs=opus";
      MediaRecorder.isTypeSupported(t) || (t = "video/mp4"), this.localTrackRecorder = new Bm(this, {
        mimeType: t
      });
    }
    this.localTrackRecorder.start(e), this.autoStopPreConnectBuffer = setTimeout(() => {
      this.log.warn("preconnect buffer timed out, stopping recording automatically", this.logContext), this.stopPreConnectBuffer();
    }, Vm);
  }
  /** @internal */
  stopPreConnectBuffer() {
    clearTimeout(this.autoStopPreConnectBuffer), this.localTrackRecorder && (this.localTrackRecorder.stop(), this.localTrackRecorder = void 0);
  }
  /** @internal */
  getPreConnectBuffer() {
    var e;
    return (e = this.localTrackRecorder) === null || e === void 0 ? void 0 : e.byteStream;
  }
  getPreConnectBufferMimeType() {
    var e;
    return (e = this.localTrackRecorder) === null || e === void 0 ? void 0 : e.mimeType;
  }
}
class sr extends yl {
  /**
   * boolean indicating whether enhanced noise cancellation is currently being used on this track
   */
  get enhancedNoiseCancellation() {
    return this.isKrispNoiseFilterEnabled;
  }
  /**
   *
   * @param mediaTrack
   * @param constraints MediaTrackConstraints that are being used when restarting or reacquiring tracks
   * @param userProvidedTrack Signals to the SDK whether or not the mediaTrack should be managed (i.e. released and reacquired) internally by the SDK
   */
  constructor(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0, r = arguments.length > 3 ? arguments[3] : void 0, s = arguments.length > 4 ? arguments[4] : void 0;
    super(e, C.Kind.Audio, t, n, s), this.stopOnMute = !1, this.isKrispNoiseFilterEnabled = !1, this.monitorSender = () => m(this, void 0, void 0, function* () {
      if (!this.sender) {
        this._currentBitrate = 0;
        return;
      }
      let o;
      try {
        o = yield this.getSenderStats();
      } catch (a) {
        this.log.error("could not get audio sender stats", Object.assign(Object.assign({}, this.logContext), {
          error: a
        }));
        return;
      }
      o && this.prevStats && (this._currentBitrate = rr(o, this.prevStats)), this.prevStats = o;
    }), this.handleKrispNoiseFilterEnable = () => {
      this.isKrispNoiseFilterEnabled = !0, this.log.debug("Krisp noise filter enabled", this.logContext), this.emit(R.AudioTrackFeatureUpdate, this, ge.TF_ENHANCED_NOISE_CANCELLATION, !0);
    }, this.handleKrispNoiseFilterDisable = () => {
      this.isKrispNoiseFilterEnabled = !1, this.log.debug("Krisp noise filter disabled", this.logContext), this.emit(R.AudioTrackFeatureUpdate, this, ge.TF_ENHANCED_NOISE_CANCELLATION, !1);
    }, this.audioContext = r, this.checkForSilence();
  }
  mute() {
    const e = Object.create(null, {
      mute: {
        get: () => super.mute
      }
    });
    return m(this, void 0, void 0, function* () {
      const t = yield this.muteLock.lock();
      try {
        return this.isMuted ? (this.log.debug("Track already muted", this.logContext), this) : (this.source === C.Source.Microphone && this.stopOnMute && !this.isUserProvided && (this.log.debug("stopping mic track", this.logContext), this._mediaStreamTrack.stop()), yield e.mute.call(this), this);
      } finally {
        t();
      }
    });
  }
  unmute() {
    const e = Object.create(null, {
      unmute: {
        get: () => super.unmute
      }
    });
    return m(this, void 0, void 0, function* () {
      const t = yield this.muteLock.lock();
      try {
        return this.isMuted ? (this.source === C.Source.Microphone && (this.stopOnMute || this._mediaStreamTrack.readyState === "ended" || this.pendingDeviceChange) && !this.isUserProvided && (this.log.debug("reacquiring mic track", this.logContext), yield this.restart(void 0, !0)), yield e.unmute.call(this), this) : (this.log.debug("Track already unmuted", this.logContext), this);
      } finally {
        t();
      }
    });
  }
  restartTrack(e) {
    return m(this, void 0, void 0, function* () {
      let t;
      if (e) {
        const n = aa({
          audio: e
        });
        typeof n.audio != "boolean" && (t = n.audio);
      }
      yield this.restart(t);
    });
  }
  applyConstraints(e) {
    return m(this, void 0, void 0, function* () {
      const t = yield this.trackChangeLock.lock();
      try {
        const n = yield this._mediaStreamTrack.applyConstraints(e);
        return this._constraints = Object.assign(Object.assign({}, this._constraints), e), n;
      } finally {
        t();
      }
    });
  }
  restart(e, t) {
    const n = Object.create(null, {
      restart: {
        get: () => super.restart
      }
    });
    return m(this, void 0, void 0, function* () {
      const r = yield n.restart.call(this, e, t);
      return this.checkForSilence(), r;
    });
  }
  /* @internal */
  startMonitor() {
    _e() && (this.monitorInterval || (this.monitorInterval = setInterval(() => {
      this.monitorSender();
    }, va)));
  }
  /**
   * registers the krisp feature listeners on the given processed track, moving them over from
   * a previously observed one. Passing `undefined` just removes the existing listeners.
   */
  observeProcessedTrack(e) {
    this.observedProcessedTrack !== e && (this.observedProcessedTrack && (this.observedProcessedTrack.removeEventListener("enable-lk-krisp-noise-filter", this.handleKrispNoiseFilterEnable), this.observedProcessedTrack.removeEventListener("disable-lk-krisp-noise-filter", this.handleKrispNoiseFilterDisable), this.observedProcessedTrack = void 0, this.isKrispNoiseFilterEnabled && this.handleKrispNoiseFilterDisable()), e && (e.addEventListener("enable-lk-krisp-noise-filter", this.handleKrispNoiseFilterEnable), e.addEventListener("disable-lk-krisp-noise-filter", this.handleKrispNoiseFilterDisable), this.observedProcessedTrack = e));
  }
  /**
   * Sets a processor on this track.
   *
   * The processor is destroyed when the track is stopped, and also when the audio context goes
   * away, so a disconnect ends it on both counts and it has to be set again after reconnecting.
   * See {@link TrackProcessor} for the full lifecycle.
   */
  setProcessor(e) {
    return m(this, void 0, void 0, function* () {
      var t;
      const n = yield this.trackChangeLock.lock();
      try {
        if (!qe() && !this.audioContext)
          throw Error("Audio context needs to be set on LocalAudioTrack in order to enable processors");
        this.processor && (yield this.internalStopProcessor());
        const r = {
          kind: this.kind,
          track: this._mediaStreamTrack,
          // RN won't have or use AudioContext
          audioContext: this.audioContext,
          localTrack: this
        };
        this.log.debug("setting up audio processor ".concat(e.name), this.logContext), yield e.init(r), this.processor = e, this.processor.processedTrack && (yield (t = this.sender) === null || t === void 0 ? void 0 : t.replaceTrack(this.processor.processedTrack), this.observeProcessedTrack(this.processor.processedTrack)), this.emit(R.TrackProcessorUpdate, this.processor);
      } finally {
        n();
      }
    });
  }
  onMediaStreamTrackChanged() {
    return m(this, void 0, void 0, function* () {
      var e;
      this.observeProcessedTrack((e = this.processor) === null || e === void 0 ? void 0 : e.processedTrack);
    });
  }
  internalStopProcessor() {
    const e = Object.create(null, {
      internalStopProcessor: {
        get: () => super.internalStopProcessor
      }
    });
    return m(this, arguments, void 0, function() {
      var t = this;
      let n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0;
      return (function* () {
        t.observeProcessedTrack(void 0), yield e.internalStopProcessor.call(t, n);
      })();
    });
  }
  stop() {
    this.observeProcessedTrack(void 0), super.stop();
  }
  /**
   * @internal
   * @experimental
   *
   * A processor's nodes (`AudioWorkletNode`, ...) can't move between contexts, so the processor
   * is rebuilt whenever the context changes and torn down when there is none left to run in.
   */
  setAudioContext(e) {
    return m(this, void 0, void 0, function* () {
      var t;
      if (this.audioContext === e)
        return;
      const n = yield this.trackChangeLock.lock();
      try {
        if (this.audioContext = e, !this.processor || qe())
          return;
        if (!e) {
          this.log.debug("stopping audio processor, audio context has been removed", this.logContext), yield this.internalStopProcessor();
          return;
        }
        this.log.debug("restarting audio processor on new audio context", this.logContext), yield this.processor.restart({
          kind: this.kind,
          track: this._mediaStreamTrack,
          audioContext: e,
          localTrack: this
        }), this.processor.processedTrack && (yield (t = this.sender) === null || t === void 0 ? void 0 : t.replaceTrack(this.processor.processedTrack), this.observeProcessedTrack(this.processor.processedTrack)), this.emit(R.TrackProcessorUpdate, this.processor);
      } finally {
        n();
      }
    });
  }
  getSenderStats() {
    return m(this, void 0, void 0, function* () {
      var e;
      if (!(!((e = this.sender) === null || e === void 0) && e.getStats))
        return;
      const t = yield this.sender.getStats();
      let n;
      return t.forEach((r) => {
        if (r.type === "outbound-rtp") {
          n = {
            type: "audio",
            streamId: r.id,
            packetsSent: r.packetsSent,
            bytesSent: r.bytesSent,
            timestamp: r.timestamp
          };
          const s = t.get(r.remoteId);
          s && (n.packetsLost = s.packetsLost, n.jitter = s.jitter, n.roundTripTime = s.roundTripTime);
        }
      }), n;
    });
  }
  checkForSilence() {
    return m(this, void 0, void 0, function* () {
      const e = yield Xd(this);
      return e && (this.isMuted || this.log.debug("silence detected on local audio track", this.logContext), this.emit(R.AudioSilenceDetected)), e;
    });
  }
}
class kl extends C {
  constructor(e, t, n, r, s) {
    super(e, n, s), this.timeSyncLoop = () => {
      var o;
      if (this.listenerCount(R.TimeSyncUpdate) === 0) {
        this.timeSyncHandle = void 0;
        return;
      }
      this.timeSyncHandle = requestAnimationFrame(this.timeSyncLoop);
      const a = (o = this.receiver) === null || o === void 0 ? void 0 : o.getSynchronizationSources()[0];
      if (a) {
        const c = a.timestamp, d = a.rtpTimestamp;
        d && this.rtpTimestamp !== d && (this.emit(R.TimeSyncUpdate, {
          timestamp: c,
          rtpTimestamp: d
        }), this.rtpTimestamp = d);
      }
    }, this.onTimeSyncListenerAdded = (o) => {
      o === R.TimeSyncUpdate && this.timeSyncHandle === void 0 && (this.timeSyncHandle = requestAnimationFrame(this.timeSyncLoop));
    }, this.sid = t, this.receiver = r;
  }
  get isLocal() {
    return !1;
  }
  /** @internal */
  setMuted(e) {
    this.isMuted !== e && (this.isMuted = e, this._mediaStreamTrack.enabled = !e, this.emit(e ? R.Muted : R.Unmuted, this));
  }
  /** @internal */
  setMediaStream(e) {
    this.mediaStream = e;
    const t = (n) => {
      n.track === this._mediaStreamTrack && (e.removeEventListener("removetrack", t), this.receiver && "playoutDelayHint" in this.receiver && (this.receiver.playoutDelayHint = void 0), this.receiver = void 0, this._currentBitrate = 0, this.emit(R.Ended, this));
    };
    e.addEventListener("removetrack", t);
  }
  start() {
    this.startMonitor(), super.enable();
  }
  stop() {
    this.stopMonitor(), super.disable();
  }
  /**
   * Gets the RTCStatsReport for the RemoteTrack's underlying RTCRtpReceiver
   * See https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport
   *
   * @returns Promise<RTCStatsReport> | undefined
   */
  getRTCStatsReport() {
    return m(this, void 0, void 0, function* () {
      var e;
      return !((e = this.receiver) === null || e === void 0) && e.getStats ? yield this.receiver.getStats() : void 0;
    });
  }
  /**
   * Allows to set a playout delay (in seconds) for this track.
   * A higher value allows for more buffering of the track in the browser
   * and will result in a delay of media being played back of `delayInSeconds`
   */
  setPlayoutDelay(e) {
    this.receiver ? "playoutDelayHint" in this.receiver ? this.receiver.playoutDelayHint = e : this.log.warn("Playout delay not supported in this browser") : this.log.warn("Cannot set playout delay, track already ended");
  }
  /**
   * Returns the current playout delay (in seconds) of this track.
   */
  getPlayoutDelay() {
    if (this.receiver) {
      if ("playoutDelayHint" in this.receiver)
        return this.receiver.playoutDelayHint;
      this.log.warn("Playout delay not supported in this browser");
    } else
      this.log.warn("Cannot get playout delay, track already ended");
    return 0;
  }
  /* @internal */
  startMonitor() {
    this.monitorInterval || (this.monitorInterval = setInterval(() => this.monitorReceiver(), va)), Of() && this.registerTimeSyncUpdate();
  }
  /* @internal */
  stopMonitor() {
    super.stopMonitor(), this.off("newListener", this.onTimeSyncListenerAdded);
  }
  registerTimeSyncUpdate() {
    const e = this;
    e.off("newListener", this.onTimeSyncListenerAdded), e.on("newListener", this.onTimeSyncListenerAdded), this.timeSyncHandle === void 0 && this.timeSyncLoop();
  }
}
class Wm extends kl {
  constructor(e, t, n, r, s, o) {
    super(e, t, C.Kind.Audio, n, o), this.connectedNodes = [], this.monitorReceiver = () => m(this, void 0, void 0, function* () {
      if (!this.receiver) {
        this._currentBitrate = 0;
        return;
      }
      const a = yield this.getReceiverStats();
      a && this.prevStats && this.receiver && (this._currentBitrate = rr(a, this.prevStats)), this.prevStats = a;
    }), this.audioContext = r, this.webAudioPluginNodes = [], s && (this.sinkId = s.deviceId);
  }
  /**
   * sets the volume for all attached audio elements
   */
  setVolume(e) {
    var t;
    if (this.audioContext)
      (t = this.gainNode) === null || t === void 0 || t.gain.setTargetAtTime(e, 0, 0.1);
    else
      for (const n of this.attachedElements)
        n.volume = e;
    qe() && this._mediaStreamTrack._setVolume(e), this.elementVolume = e;
  }
  /**
   * gets the volume of attached audio elements (loudest)
   */
  getVolume() {
    if (this.elementVolume !== void 0)
      return this.elementVolume;
    if (qe())
      return 1;
    let e = 0;
    return this.attachedElements.forEach((t) => {
      t.volume > e && (e = t.volume);
    }), e;
  }
  /**
   * calls setSinkId on all attached elements, if supported
   * @param deviceId audio output device
   */
  setSinkId(e) {
    return m(this, void 0, void 0, function* () {
      this.sinkId = e, yield Promise.all(this.attachedElements.map((t) => {
        if (vs(t))
          return t.setSinkId(e);
      }));
    });
  }
  attach(e) {
    const t = !this.sourceNode;
    return e ? super.attach(e) : e = super.attach(), this.sinkId && vs(e) && e.setSinkId(this.sinkId).catch((n) => {
      this.log.error("Failed to set sink id on remote audio track", n, this.logContext);
    }), this.audioContext && (e.volume = 0, e.muted = !0, t && (this.log.debug("using audio context mapping", this.logContext), this.connectWebAudio(this.audioContext, e))), this.elementVolume !== void 0 && this.setVolume(this.elementVolume), e;
  }
  detach(e) {
    let t;
    return e ? (t = super.detach(e), this.audioContext && (this.attachedElements.length > 0 ? this.connectWebAudio(this.audioContext, this.attachedElements[0]) : this.disconnectWebAudio())) : (t = super.detach(), this.disconnectWebAudio()), t;
  }
  /**
   * @internal
   * @experimental
   */
  setAudioContext(e) {
    var t;
    if (this.audioContext !== e)
      if (this.audioContext = e, e) {
        for (const n of this.attachedElements)
          n.volume = 0, n.muted = !0;
        this.attachedElements.length > 0 && this.connectWebAudio(e, this.attachedElements[0]);
      } else {
        this.disconnectWebAudio();
        for (const n of this.attachedElements)
          n.muted = !1, n.volume = (t = this.elementVolume) !== null && t !== void 0 ? t : 1;
      }
  }
  /**
   * @internal
   * @experimental
   * @param {AudioNode[]} nodes - An array of WebAudio nodes. These nodes should not be connected to each other when passed, as the sdk will take care of connecting them in the order of the array.
   */
  setWebAudioPlugins(e) {
    this.webAudioPluginNodes = e, this.attachedElements.length > 0 && this.audioContext && this.connectWebAudio(this.audioContext, this.attachedElements[0]);
  }
  connectWebAudio(e, t) {
    this.disconnectWebAudio(), this.sourceNode = e.createMediaStreamSource(t.srcObject);
    let n = this.sourceNode;
    this.connectedNodes = [this.sourceNode], this.webAudioPluginNodes.forEach((r) => {
      n.connect(r), n = r, this.connectedNodes.push(r);
    }), this.gainNode = e.createGain(), n.connect(this.gainNode), this.connectedNodes.push(this.gainNode), this.gainNode.connect(e.destination), this.elementVolume !== void 0 && this.gainNode.gain.setTargetAtTime(this.elementVolume, 0, 0.1), e.state !== "running" && e.resume().then(() => {
      e.state !== "running" && this.emit(R.AudioPlaybackFailed, new Error("Audio Context couldn't be started automatically"));
    }).catch((r) => {
      this.emit(R.AudioPlaybackFailed, r);
    });
  }
  disconnectWebAudio() {
    var e, t;
    for (let n = 0; n < this.connectedNodes.length - 1; n += 1)
      try {
        this.connectedNodes[n].disconnect(this.connectedNodes[n + 1]);
      } catch {
      }
    this.connectedNodes = [], (e = this.gainNode) === null || e === void 0 || e.disconnect(), (t = this.sourceNode) === null || t === void 0 || t.disconnect(), this.gainNode = void 0, this.sourceNode = void 0;
  }
  getReceiverStats() {
    return m(this, void 0, void 0, function* () {
      if (!this.receiver || !this.receiver.getStats)
        return;
      const e = yield this.receiver.getStats();
      let t;
      return e.forEach((n) => {
        n.type === "inbound-rtp" && (t = {
          type: "audio",
          streamId: n.id,
          timestamp: n.timestamp,
          jitter: n.jitter,
          bytesReceived: n.bytesReceived,
          concealedSamples: n.concealedSamples,
          concealmentEvents: n.concealmentEvents,
          silentConcealedSamples: n.silentConcealedSamples,
          silentConcealmentEvents: n.silentConcealmentEvents,
          totalAudioEnergy: n.totalAudioEnergy,
          totalSamplesDuration: n.totalSamplesDuration
        });
      }), t;
    });
  }
}
class ht extends xe.EventEmitter {
  constructor(e, t, n, r) {
    var s;
    super(), this.metadataMuted = !1, this.encryption = H.NONE, this.log = q, this.handleMuted = () => {
      this.emit(R.Muted);
    }, this.handleUnmuted = () => {
      this.emit(R.Unmuted);
    }, this.log = pe((s = r?.loggerName) !== null && s !== void 0 ? s : ne.Publication), this.loggerContextCb = this.loggerContextCb, this.setMaxListeners(100), this.kind = e, this.trackSid = t, this.trackName = n, this.source = C.Source.Unknown;
  }
  /** @internal */
  setTrack(e) {
    this.track && (this.track.off(R.Muted, this.handleMuted), this.track.off(R.Unmuted, this.handleUnmuted)), this.track = e, e && (e.on(R.Muted, this.handleMuted), e.on(R.Unmuted, this.handleUnmuted));
  }
  get logContext() {
    var e;
    return Object.assign(Object.assign({}, (e = this.loggerContextCb) === null || e === void 0 ? void 0 : e.call(this)), B(this));
  }
  get isMuted() {
    return this.metadataMuted;
  }
  get isEnabled() {
    return !0;
  }
  get isSubscribed() {
    return this.track !== void 0;
  }
  get isEncrypted() {
    return this.encryption !== H.NONE;
  }
  /**
   * an [AudioTrack] if this publication holds an audio track
   */
  get audioTrack() {
    if (at(this.track))
      return this.track;
  }
  /**
   * an [VideoTrack] if this publication holds a video track
   */
  get videoTrack() {
    if (yt(this.track))
      return this.track;
  }
  /** @internal */
  updateInfo(e) {
    this.trackSid = e.sid, this.trackName = e.name, this.source = C.sourceFromProto(e.source), this.mimeType = e.mimeType, this.kind === C.Kind.Video && e.width > 0 && (this.dimensions = {
      width: e.width,
      height: e.height
    }, this.simulcasted = e.simulcast), this.encryption = e.encryption, this.trackInfo = e, this.log.debug("update publication info", Object.assign(Object.assign({}, this.logContext), {
      info: e
    }));
  }
}
(function(i) {
  (function(e) {
    e.Desired = "desired", e.Subscribed = "subscribed", e.Unsubscribed = "unsubscribed";
  })(i.SubscriptionStatus || (i.SubscriptionStatus = {})), (function(e) {
    e.Allowed = "allowed", e.NotAllowed = "not_allowed";
  })(i.PermissionStatus || (i.PermissionStatus = {}));
})(ht || (ht = {}));
class _s extends ht {
  get isUpstreamPaused() {
    var e;
    return (e = this.track) === null || e === void 0 ? void 0 : e.isUpstreamPaused;
  }
  constructor(e, t, n, r) {
    super(e, t.sid, t.name, r), this.track = void 0, this.handleTrackEnded = () => {
      this.emit(R.Ended);
    }, this.handleCpuConstrained = () => {
      this.track && yt(this.track) && this.emit(R.CpuConstrained, this.track);
    }, this.updateInfo(t), this.setTrack(n);
  }
  setTrack(e) {
    this.track && (this.track.off(R.Ended, this.handleTrackEnded), this.track.off(R.CpuConstrained, this.handleCpuConstrained)), super.setTrack(e), e && (e.on(R.Ended, this.handleTrackEnded), e.on(R.CpuConstrained, this.handleCpuConstrained));
  }
  get isMuted() {
    return this.track ? this.track.isMuted : super.isMuted;
  }
  get audioTrack() {
    return super.audioTrack;
  }
  get videoTrack() {
    return super.videoTrack;
  }
  get isLocal() {
    return !0;
  }
  /**
   * Mute the track associated with this publication
   */
  mute() {
    return m(this, void 0, void 0, function* () {
      var e;
      return (e = this.track) === null || e === void 0 ? void 0 : e.mute();
    });
  }
  /**
   * Unmute track associated with this publication
   */
  unmute() {
    return m(this, void 0, void 0, function* () {
      var e;
      return (e = this.track) === null || e === void 0 ? void 0 : e.unmute();
    });
  }
  /**
   * Pauses the media stream track associated with this publication from being sent to the server
   * and signals "muted" event to other participants
   * Useful if you want to pause the stream without pausing the local media stream track
   */
  pauseUpstream() {
    return m(this, void 0, void 0, function* () {
      var e;
      yield (e = this.track) === null || e === void 0 ? void 0 : e.pauseUpstream();
    });
  }
  /**
   * Resumes sending the media stream track associated with this publication to the server after a call to [[pauseUpstream()]]
   * and signals "unmuted" event to other participants (unless the track is explicitly muted)
   */
  resumeUpstream() {
    return m(this, void 0, void 0, function* () {
      var e;
      yield (e = this.track) === null || e === void 0 ? void 0 : e.resumeUpstream();
    });
  }
  getTrackFeatures() {
    var e;
    if (at(this.track)) {
      const t = this.track.getSourceTrackSettings(), n = /* @__PURE__ */ new Set();
      return t.autoGainControl && n.add(ge.TF_AUTO_GAIN_CONTROL), t.echoCancellation && n.add(ge.TF_ECHO_CANCELLATION), t.noiseSuppression && n.add(ge.TF_NOISE_SUPPRESSION), t.channelCount && t.channelCount > 1 && n.add(ge.TF_STEREO), !((e = this.options) === null || e === void 0) && e.dtx || n.add(ge.TF_NO_DTX), this.track.enhancedNoiseCancellation && n.add(ge.TF_ENHANCED_NOISE_CANCELLATION), Array.from(n.values());
    } else return [];
  }
}
let Ps;
function Hm(i) {
  Ps = i;
}
function Fi() {
  if (!Ps)
    throw new st("video capture is not available in this build, add the video extension");
  return Ps;
}
function Cn(i, e) {
  return m(this, void 0, void 0, function* () {
    i ?? (i = {});
    let t = !1;
    const n = el(i), r = n.audioProcessor, s = n.videoProcessor, o = n.optionsWithoutProcessor;
    let a = o.audio, c = o.video;
    if (r && typeof o.audio == "object" && (o.audio.processor = r), s && typeof o.video == "object" && (o.video.processor = s), i.audio && typeof o.audio == "object" && typeof o.audio.deviceId == "string") {
      const h = o.audio.deviceId;
      o.audio.deviceId = {
        exact: h
      }, t = !0, a = Object.assign(Object.assign({}, o.audio), {
        deviceId: {
          ideal: h
        }
      });
    }
    if (o.video && typeof o.video == "object" && typeof o.video.deviceId == "string") {
      const h = o.video.deviceId;
      o.video.deviceId = {
        exact: h
      }, t = !0, c = Object.assign(Object.assign({}, o.video), {
        deviceId: {
          ideal: h
        }
      });
    }
    o.audio === !0 ? o.audio = {
      deviceId: "default"
    } : typeof o.audio == "object" && o.audio !== null && (o.audio = Object.assign(Object.assign({}, o.audio), {
      deviceId: o.audio.deviceId || "default"
    })), o.video === !0 ? o.video = {
      deviceId: "default"
    } : typeof o.video == "object" && !o.video.deviceId && (o.video.deviceId = "default");
    const d = Yd(o, gl, o.video ? Fi().defaults : void 0), l = aa(d), u = navigator.mediaDevices.getUserMedia(l);
    o.audio && (he.userMediaPromiseMap.set("audioinput", u), u.catch(() => he.userMediaPromiseMap.delete("audioinput"))), o.video && (he.userMediaPromiseMap.set("videoinput", u), u.catch(() => he.userMediaPromiseMap.delete("videoinput")));
    try {
      const h = yield u;
      return yield Promise.all(h.getTracks().map((f) => m(this, void 0, void 0, function* () {
        const g = f.kind === "audio";
        let p;
        const y = g ? l.audio : l.video;
        typeof y != "boolean" && (p = y);
        const k = f.getSettings().deviceId;
        p?.deviceId && hn(p.deviceId) !== k ? p.deviceId = k : p || (p = {
          deviceId: k
        });
        const w = f.kind === "audio" ? new sr(f, p, !1, void 0, e) : Fi().createTrack(f, p, !1, e);
        return w.kind === C.Kind.Video ? w.source = C.Source.Camera : w.kind === C.Kind.Audio && (w.source = C.Source.Microphone), w.mediaStream = h, at(w) && r ? yield w.setProcessor(r) : yt(w) && s && (yield w.setProcessor(s)), w;
      })));
    } catch (h) {
      if (!t)
        throw h;
      return Cn(Object.assign(Object.assign({}, i), {
        audio: a,
        video: c
      }), e);
    }
  });
}
function zm(i) {
  return m(this, void 0, void 0, function* () {
    return (yield Cn({
      audio: !0,
      video: !1
    }))[0];
  });
}
var Ct;
(function(i) {
  i.Excellent = "excellent", i.Good = "good", i.Poor = "poor", i.Lost = "lost", i.Unknown = "unknown";
})(Ct || (Ct = {}));
function Km(i) {
  switch (i) {
    case nn.EXCELLENT:
      return Ct.Excellent;
    case nn.GOOD:
      return Ct.Good;
    case nn.POOR:
      return Ct.Poor;
    case nn.LOST:
      return Ct.Lost;
    default:
      return Ct.Unknown;
  }
}
class Tl extends xe.EventEmitter {
  get logContext() {
    var e, t;
    return Object.assign({}, (t = (e = this.loggerOptions) === null || e === void 0 ? void 0 : e.loggerContextCb) === null || t === void 0 ? void 0 : t.call(e));
  }
  get isEncrypted() {
    return this.trackPublications.size > 0 && Array.from(this.trackPublications.values()).every((e) => e.isEncrypted);
  }
  get isAgent() {
    var e;
    return ((e = this.permissions) === null || e === void 0 ? void 0 : e.agent) || this.kind === Gn.AGENT;
  }
  get isActive() {
    var e;
    return ((e = this.participantInfo) === null || e === void 0 ? void 0 : e.state) === on.ACTIVE;
  }
  get kind() {
    return this._kind;
  }
  /** participant attributes, similar to metadata, but as a key/value map */
  get attributes() {
    return Object.freeze(Object.assign({}, this._attributes));
  }
  /** @internal */
  constructor(e, t, n, r, s, o) {
    let a = arguments.length > 6 && arguments[6] !== void 0 ? arguments[6] : Gn.STANDARD;
    var c;
    super(), this.audioLevel = 0, this.isSpeaking = !1, this._connectionQuality = Ct.Unknown, this.log = q, this.loggerOptions = o, this.log = pe((c = o?.loggerName) !== null && c !== void 0 ? c : ne.Participant, () => this.logContext), this.setMaxListeners(100), this.sid = e, this.identity = t, this.name = n, this.metadata = r, this.audioTrackPublications = /* @__PURE__ */ new Map(), this.videoTrackPublications = /* @__PURE__ */ new Map(), this.trackPublications = /* @__PURE__ */ new Map(), this._kind = a, this._attributes = s ?? {};
  }
  getTrackPublications() {
    return Array.from(this.trackPublications.values());
  }
  /**
   * Finds the first track that matches the source filter, for example, getting
   * the user's camera track with getTrackBySource(Track.Source.Camera).
   */
  getTrackPublication(e) {
    for (const n of this.trackPublications) {
      var t = L(n, 2);
      const r = t[1];
      if (r.source === e)
        return r;
    }
  }
  /**
   * Finds the first track that matches the track's name.
   */
  getTrackPublicationByName(e) {
    for (const n of this.trackPublications) {
      var t = L(n, 2);
      const r = t[1];
      if (r.trackName === e)
        return r;
    }
  }
  /**
   * Waits until the participant is active and ready to receive data messages
   * @returns a promise that resolves when the participant is active
   */
  waitUntilActive() {
    return this.isActive ? Promise.resolve() : this.activeFuture ? this.activeFuture.promise : (this.activeFuture = new ye(), this.once(x.Active, () => {
      var e, t;
      (t = (e = this.activeFuture) === null || e === void 0 ? void 0 : e.resolve) === null || t === void 0 || t.call(e), this.activeFuture = void 0;
    }), this.activeFuture.promise);
  }
  get connectionQuality() {
    return this._connectionQuality;
  }
  get isCameraEnabled() {
    var e;
    const t = this.getTrackPublication(C.Source.Camera);
    return !(!((e = t?.isMuted) !== null && e !== void 0) || e);
  }
  get isMicrophoneEnabled() {
    var e;
    const t = this.getTrackPublication(C.Source.Microphone);
    return !(!((e = t?.isMuted) !== null && e !== void 0) || e);
  }
  get isScreenShareEnabled() {
    return !!this.getTrackPublication(C.Source.ScreenShare);
  }
  get isLocal() {
    return !1;
  }
  /** when participant joined the room */
  get joinedAt() {
    return this.participantInfo ? new Date(Number.parseInt(this.participantInfo.joinedAt.toString()) * 1e3) : /* @__PURE__ */ new Date();
  }
  /**
   * @internal
   * Whether `info` belongs to an older session of this identity than the stored one.
   * Uses the same order as the server: `joinedAt`, then `joinedAtMs` when both are set, then sid.
   */
  isOlderSession(e) {
    const t = this.participantInfo;
    return !t || t.sid === e.sid ? !1 : e.joinedAt !== t.joinedAt ? e.joinedAt < t.joinedAt : e.joinedAtMs && t.joinedAtMs && e.joinedAtMs !== t.joinedAtMs ? e.joinedAtMs < t.joinedAtMs : e.sid < t.sid;
  }
  /** @internal */
  updateInfo(e) {
    var t;
    return this.participantInfo && this.participantInfo.sid === e.sid && this.participantInfo.version > e.version ? !1 : (this.identity = e.identity, this.sid = e.sid, this._setName(e.name), this._setMetadata(e.metadata), this._setAttributes(e.attributes), e.state === on.ACTIVE && ((t = this.participantInfo) === null || t === void 0 ? void 0 : t.state) !== on.ACTIVE && this.emit(x.Active), e.permission && this.setPermissions(e.permission), this.participantInfo = e, !0);
  }
  /**
   * Updates metadata from server
   **/
  _setMetadata(e) {
    const t = this.metadata !== e, n = this.metadata;
    this.metadata = e, t && this.emit(x.ParticipantMetadataChanged, n);
  }
  _setName(e) {
    const t = this.name !== e;
    this.name = e, t && this.emit(x.ParticipantNameChanged, e);
  }
  /**
   * Updates metadata from server
   **/
  _setAttributes(e) {
    const t = Lf(this.attributes, e);
    this._attributes = e, Object.keys(t).length > 0 && this.emit(x.AttributesChanged, t);
  }
  /** @internal */
  setPermissions(e) {
    var t, n, r, s, o, a;
    const c = this.permissions, d = e.canPublish !== ((t = this.permissions) === null || t === void 0 ? void 0 : t.canPublish) || e.canSubscribe !== ((n = this.permissions) === null || n === void 0 ? void 0 : n.canSubscribe) || e.canPublishData !== ((r = this.permissions) === null || r === void 0 ? void 0 : r.canPublishData) || e.hidden !== ((s = this.permissions) === null || s === void 0 ? void 0 : s.hidden) || e.recorder !== ((o = this.permissions) === null || o === void 0 ? void 0 : o.recorder) || e.canPublishSources.length !== this.permissions.canPublishSources.length || e.canPublishSources.some((l, u) => {
      var h;
      return l !== ((h = this.permissions) === null || h === void 0 ? void 0 : h.canPublishSources[u]);
    }) || e.canSubscribeMetrics !== ((a = this.permissions) === null || a === void 0 ? void 0 : a.canSubscribeMetrics);
    return this.permissions = e, d && this.emit(x.ParticipantPermissionsChanged, c), d;
  }
  /** @internal */
  setIsSpeaking(e) {
    e !== this.isSpeaking && (this.isSpeaking = e, e && (this.lastSpokeAt = /* @__PURE__ */ new Date()), this.emit(x.IsSpeakingChanged, e));
  }
  /** @internal */
  setConnectionQuality(e) {
    const t = this._connectionQuality;
    this._connectionQuality = Km(e), t !== this._connectionQuality && this.emit(x.ConnectionQualityChanged, this._connectionQuality);
  }
  /**
   * @internal
   */
  setDisconnected() {
    var e, t;
    this.activeFuture && ((t = (e = this.activeFuture).reject) === null || t === void 0 || t.call(e, new Error("Participant disconnected")), this.activeFuture = void 0);
  }
  /**
   * @internal
   */
  setAudioContext(e) {
    return m(this, void 0, void 0, function* () {
      this.audioContext = e, yield Promise.all(Array.from(this.audioTrackPublications.values()).map((t) => t.track).filter(at).map((t) => t.setAudioContext(e)));
    });
  }
  addTrackPublication(e) {
    this.log.debug("adding track publication", {
      trackSid: e.trackSid,
      source: e.source,
      kind: e.kind
    }), e.on(R.Muted, () => {
      this.emit(x.TrackMuted, e);
    }), e.on(R.Unmuted, () => {
      this.emit(x.TrackUnmuted, e);
    });
    const t = e;
    switch (t.track && (t.track.sid = e.trackSid), this.trackPublications.set(e.trackSid, e), e.kind) {
      case C.Kind.Audio:
        this.audioTrackPublications.set(e.trackSid, e);
        break;
      case C.Kind.Video:
        this.videoTrackPublications.set(e.trackSid, e);
        break;
    }
  }
}
function Gm(i) {
  var e, t, n;
  if (!i.participantSid && !i.participantIdentity)
    throw new Error("Invalid track permission, must provide at least one of participantIdentity and participantSid");
  return new qd({
    participantIdentity: (e = i.participantIdentity) !== null && e !== void 0 ? e : "",
    participantSid: (t = i.participantSid) !== null && t !== void 0 ? t : "",
    allTracks: (n = i.allowAll) !== null && n !== void 0 ? n : !1,
    trackSids: i.allowedTrackSids || []
  });
}
class qo extends Tl {
  /** @internal */
  constructor(e, t, n, r) {
    let s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {};
    super(e, t, void 0, void 0, void 0, {
      loggerName: r.loggerName,
      loggerContextCb: () => this.engine.logContext
    }), this.pendingPublishing = /* @__PURE__ */ new Set(), this.pendingPublishPromises = /* @__PURE__ */ new Map(), this.participantTrackPermissions = [], this.allParticipantsAllowedToSubscribe = !0, this.encryptionType = H.NONE, this.e2eeStateMutex = new fe(), this.enabledPublishVideoCodecs = [], this.handleReconnecting = () => {
      this.reconnectFuture || (this.reconnectFuture = new ye());
    }, this.handleReconnected = () => {
      var o, a;
      (a = (o = this.reconnectFuture) === null || o === void 0 ? void 0 : o.resolve) === null || a === void 0 || a.call(o), this.reconnectFuture = void 0, this.updateTrackSubscriptionPermissions();
    }, this.handleClosing = () => {
      var o, a, c, d, l, u;
      this.reconnectFuture && (this.reconnectFuture.promise.catch((h) => this.log.warn(h.message)), (a = (o = this.reconnectFuture) === null || o === void 0 ? void 0 : o.reject) === null || a === void 0 || a.call(o, new Error("Got disconnected during reconnection attempt")), this.reconnectFuture = void 0), this.signalConnectedFuture && ((d = (c = this.signalConnectedFuture).reject) === null || d === void 0 || d.call(c, new Error("Got disconnected without signal connected")), this.signalConnectedFuture = void 0), (u = (l = this.activeAgentFuture) === null || l === void 0 ? void 0 : l.reject) === null || u === void 0 || u.call(l, new Error("Got disconnected without active agent present")), this.activeAgentFuture = void 0, this.firstActiveAgent = void 0;
    }, this.handleSignalConnected = (o) => {
      var a, c;
      o.participant && this.updateInfo(o.participant), this.signalConnectedFuture || (this.signalConnectedFuture = new ye()), (c = (a = this.signalConnectedFuture).resolve) === null || c === void 0 || c.call(a);
    }, this.handleSignalRequestResponse = (o) => {
      const a = o.requestId, c = o.reason, d = o.message, l = this.pendingSignalRequests.get(a);
      l && (c !== Wt.OK && l.reject(new lo(d, c)), this.pendingSignalRequests.delete(a));
    }, this.updateTrackSubscriptionPermissions = () => {
      this.log.debug("updating track subscription permissions", {
        allParticipantsAllowed: this.allParticipantsAllowedToSubscribe,
        participantTrackPermissions: this.participantTrackPermissions
      }), this.engine.client.sendUpdateSubscriptionPermissions(this.allParticipantsAllowedToSubscribe, this.participantTrackPermissions.map((o) => Gm(o)));
    }, this.onTrackUnmuted = (o) => {
      this.onTrackMuted(o, o.isUpstreamPaused);
    }, this.onTrackMuted = (o, a) => {
      if (a === void 0 && (a = !0), !o.sid) {
        this.log.error("could not update mute status for unpublished track", B(o));
        return;
      }
      this.engine.updateMuteStatus(o.sid, a);
    }, this.onTrackUpstreamPaused = (o) => {
      this.log.debug("upstream paused", B(o)), this.onTrackMuted(o, !0);
    }, this.onTrackUpstreamResumed = (o) => {
      this.log.debug("upstream resumed", B(o)), this.onTrackMuted(o, o.isMuted);
    }, this.onTrackFeatureUpdate = (o) => {
      const a = this.audioTrackPublications.get(o.sid);
      if (!a) {
        this.log.warn("Could not update local audio track settings, missing publication for track ".concat(o.sid));
        return;
      }
      this.engine.client.sendUpdateLocalAudioTrack(a.trackSid, a.getTrackFeatures());
    }, this.onTrackCpuConstrained = (o, a) => {
      this.log.debug("track cpu constrained", B(a)), this.emit(x.LocalTrackCpuConstrained, o, a);
    }, this.handleLocalTrackUnpublished = (o) => {
      const a = this.trackPublications.get(o.trackSid);
      if (!a) {
        this.log.warn("received unpublished event for unknown track", {
          trackSid: o.trackSid
        });
        return;
      }
      this.unpublishTrack(a.track);
    }, this.handleTrackEnded = (o) => m(this, void 0, void 0, function* () {
      if (o.source === C.Source.ScreenShare || o.source === C.Source.ScreenShareAudio)
        this.log.debug("unpublishing local track due to TrackEnded", B(o)), this.unpublishTrack(o);
      else if (o.isUserProvided)
        yield o.mute();
      else if (et(o) || Fe(o))
        try {
          if (_e())
            try {
              const a = yield navigator?.permissions.query({
                // the permission query for camera and microphone currently not supported in Safari and Firefox
                // @ts-ignore
                name: o.source === C.Source.Camera ? "camera" : "microphone"
              });
              if (a && a.state === "denied")
                throw this.log.warn("user has revoked access to ".concat(o.source), B(o)), a.onchange = () => {
                  a.state !== "denied" && (o.isMuted || o.restartTrack(), a.onchange = null);
                }, new Error("GetUserMedia Permission denied");
            } catch {
            }
          o.isMuted || (this.log.debug("track ended, attempting to use a different device", B(o)), et(o) ? yield this.restartOnDefaultAudioDevice(o) : yield o.restartTrack());
        } catch {
          this.log.warn("could not restart track, muting instead", B(o)), yield o.mute();
        }
    }), this.slots = s, this.audioTrackPublications = /* @__PURE__ */ new Map(), this.videoTrackPublications = /* @__PURE__ */ new Map(), this.trackPublications = /* @__PURE__ */ new Map(), this.engine = n, this.roomOptions = r, this.setupEngine(n), this.activeDeviceMap = /* @__PURE__ */ new Map([["audioinput", "default"], ["videoinput", "default"], ["audiooutput", "default"]]), this.pendingSignalRequests = /* @__PURE__ */ new Map();
  }
  get lastCameraError() {
    return this.cameraError;
  }
  get lastMicrophoneError() {
    return this.microphoneError;
  }
  get isE2EEEnabled() {
    return this.encryptionType !== H.NONE;
  }
  getTrackPublication(e) {
    const t = super.getTrackPublication(e);
    if (t)
      return t;
  }
  getTrackPublicationByName(e) {
    const t = super.getTrackPublicationByName(e);
    if (t)
      return t;
  }
  /**
   * @internal
   */
  setupEngine(e) {
    var t;
    this.engine = e, this.engine.on(P.RemoteMute, (n, r) => {
      const s = this.trackPublications.get(n);
      !s || !s.track || (r ? s.mute() : s.unmute());
    }), !((t = this.signalConnectedFuture) === null || t === void 0) && t.isResolved && (this.signalConnectedFuture = void 0), this.engine.on(P.Connected, this.handleReconnected).on(P.SignalConnected, this.handleSignalConnected).on(P.SignalRestarted, this.handleReconnected).on(P.SignalResumed, this.handleReconnected).on(P.Restarting, this.handleReconnecting).on(P.Resuming, this.handleReconnecting).on(P.LocalTrackUnpublished, this.handleLocalTrackUnpublished).on(P.Closing, this.handleClosing).on(P.SignalRequestResponse, this.handleSignalRequestResponse);
  }
  /**
   * Sets and updates the metadata of the local participant.
   * Note: this requires `canUpdateOwnMetadata` permission.
   * method will throw if the user doesn't have the required permissions
   * @param metadata
   */
  setMetadata(e) {
    return m(this, void 0, void 0, function* () {
      yield this.requestMetadataUpdate({
        metadata: e
      });
    });
  }
  /**
   * Sets and updates the name of the local participant.
   * Note: this requires `canUpdateOwnMetadata` permission.
   * method will throw if the user doesn't have the required permissions
   * @param metadata
   */
  setName(e) {
    return m(this, void 0, void 0, function* () {
      yield this.requestMetadataUpdate({
        name: e
      });
    });
  }
  /**
   * Set or update participant attributes. It will make updates only to keys that
   * are present in `attributes`, and will not override others.
   * Note: this requires `canUpdateOwnMetadata` permission.
   * @param attributes attributes to update
   */
  setAttributes(e) {
    return m(this, void 0, void 0, function* () {
      yield this.requestMetadataUpdate({
        attributes: e
      });
    });
  }
  requestMetadataUpdate(e) {
    return m(this, arguments, void 0, function(t) {
      var n = this;
      let r = t.metadata, s = t.name, o = t.attributes;
      return (function* () {
        return new Ee((a, c) => m(n, void 0, void 0, function* () {
          var d, l;
          try {
            let u = !1;
            const h = yield this.engine.client.sendUpdateLocalMetadata((d = r ?? this.metadata) !== null && d !== void 0 ? d : "", (l = s ?? this.name) !== null && l !== void 0 ? l : "", o), f = performance.now();
            for (this.pendingSignalRequests.set(h, {
              resolve: a,
              reject: (g) => {
                c(g), u = !0;
              },
              values: {
                name: s,
                metadata: r,
                attributes: o
              }
            }); performance.now() - f < 5e3 && !u; ) {
              if ((!s || this.name === s) && (!r || this.metadata === r) && (!o || Object.entries(o).every((g) => {
                let p = L(g, 2), y = p[0], k = p[1];
                return this.attributes[y] === k || k === "" && !this.attributes[y];
              }))) {
                this.pendingSignalRequests.delete(h), a();
                return;
              }
              yield be(50);
            }
            c(new lo("Request to update local metadata timed out", "TimeoutError"));
          } catch (u) {
            u instanceof Error ? c(u) : c(new Error(String(u)));
          }
        }));
      })();
    });
  }
  /**
   * Enable or disable a participant's microphone track.
   *
   * If a track has already published, it'll mute or unmute the track.
   * Resolves with a `LocalTrackPublication` instance if successful and `undefined` otherwise
   */
  setMicrophoneEnabled(e, t, n) {
    return this.setTrackEnabled(C.Source.Microphone, e, t, n);
  }
  /** @internal */
  setE2EEEnabled(e) {
    return m(this, void 0, void 0, function* () {
      const t = yield this.e2eeStateMutex.lock();
      try {
        if (this.encryptionType = e ? H.GCM : H.NONE, yield Promise.all(this.pendingPublishPromises.values()), this.trackPublications.size === 0 || Array.from(this.trackPublications.values()).every((n) => n.isEncrypted === e))
          return;
        yield this.republishAllTracks(void 0, !1);
      } finally {
        t();
      }
    });
  }
  setTrackEnabled(e, t, n, r) {
    return m(this, void 0, void 0, function* () {
      var s, o;
      this.log.debug("setTrackEnabled", {
        source: e,
        enabled: t
      }), this.republishPromise && (yield this.republishPromise);
      let a = this.getTrackPublication(e);
      if (t)
        if (a)
          yield a.unmute();
        else {
          let u;
          if (this.pendingPublishing.has(e)) {
            const h = yield this.waitForPendingPublicationOfSource(e);
            return h || this.log.info("waiting for pending publication promise timed out", {
              source: e
            }), yield h?.unmute(), h;
          }
          this.pendingPublishing.add(e);
          try {
            switch (e) {
              case C.Source.Camera:
                u = yield this.createTracks({
                  video: (s = n) !== null && s !== void 0 ? s : !0
                });
                break;
              case C.Source.Microphone:
                u = yield this.createTracks({
                  audio: (o = n) !== null && o !== void 0 ? o : !0
                });
                break;
              case C.Source.ScreenShare:
                u = yield this.requireVideoPublisher().createScreenTracks(Object.assign({}, n));
                break;
              default:
                throw new st(e);
            }
          } catch (h) {
            throw u?.forEach((f) => {
              f.stop();
            }), h instanceof Error && this.emit(x.MediaDevicesError, h, ps(e)), this.pendingPublishing.delete(e), h;
          }
          for (const h of u) {
            const f = Object.assign(Object.assign({}, this.roomOptions.publishDefaults), r);
            e === C.Source.Microphone && at(h) && f.preConnectBuffer && (this.log.info("starting preconnect buffer for microphone"), h.startPreConnectBuffer());
          }
          try {
            const h = [];
            for (const g of u)
              this.log.info("publishing track", B(g)), h.push(this.publishTrack(g, r));
            const f = yield Promise.all(h);
            var c = L(f, 1);
            a = c[0];
          } catch (h) {
            throw u?.forEach((f) => {
              f.stop();
            }), h;
          } finally {
            this.pendingPublishing.delete(e);
          }
        }
      else if (!a?.track && this.pendingPublishing.has(e) && (a = yield this.waitForPendingPublicationOfSource(e), a || this.log.info("waiting for pending publication promise timed out", {
        source: e
      })), a && a.track)
        if (e === C.Source.ScreenShare) {
          const u = [this.unpublishTrack(a.track)], h = this.getTrackPublication(C.Source.ScreenShareAudio);
          h && h.track && u.push(this.unpublishTrack(h.track));
          var d = yield Promise.all(u), l = L(d, 1);
          a = l[0];
        } else
          yield a.mute();
      return a;
    });
  }
  /**
   * Create local camera and/or microphone tracks
   * @param options
   * @returns
   */
  createTracks(e) {
    return m(this, void 0, void 0, function* () {
      var t, n;
      e ?? (e = {});
      const r = Yd(e, (t = this.roomOptions) === null || t === void 0 ? void 0 : t.audioCaptureDefaults, (n = this.roomOptions) === null || n === void 0 ? void 0 : n.videoCaptureDefaults);
      try {
        const s = yield Cn(r, {
          loggerName: this.roomOptions.loggerName,
          loggerContextCb: () => this.logContext
        });
        return yield Promise.all(s.map((a) => m(this, void 0, void 0, function* () {
          return at(a) && (this.microphoneError = void 0, yield a.setAudioContext(this.audioContext), a.source = C.Source.Microphone, this.emit(x.AudioStreamAcquired)), yt(a) && (this.cameraError = void 0, a.source = C.Source.Camera), a;
        })));
      } catch (s) {
        throw s instanceof Error && (e.audio && (this.microphoneError = s), e.video && (this.cameraError = s)), s;
      }
    });
  }
  /** @internal logger options for tracks this participant creates */
  get trackLoggerOptions() {
    return {
      loggerName: this.roomOptions.loggerName,
      loggerContextCb: () => this.logContext
    };
  }
  requireVideoPublisher() {
    if (!this.slots.videoPublisher)
      throw new st("video publishing is not available in this build, add the video extension");
    return this.slots.videoPublisher;
  }
  /**
   * Publish a new track to the room
   * @param track
   * @param options
   */
  publishTrack(e, t) {
    return m(this, void 0, void 0, function* () {
      return this.publishOrRepublishTrack(e, t);
    });
  }
  /**
   * Waits for the engine's next `Restarted` event. Unlike `engine.waitForRestarted`, this does
   * not short-circuit when `pcState === Connected` — at the point this is called (right after a
   * `NegotiationError`) the PC transport is still connected, but `fullReconnectOnNext` has been
   * set and `attemptReconnect` is queued via setTimeout. We need to wait for that restart to
   * actually complete (which clears `pendingTrackResolvers` via `cleanupClient`) before retrying.
   */
  waitForNextEngineRestart() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 15e3;
    return new Promise((t, n) => {
      const r = () => {
        clearTimeout(a), this.engine.off(P.Restarted, s), this.engine.off(P.Closing, o);
      }, s = () => {
        r(), t();
      }, o = () => {
        r(), n(new Error("engine closed before restart completed"));
      }, a = setTimeout(() => {
        r(), n(new Error("timed out waiting for engine restart"));
      }, e);
      this.engine.once(P.Restarted, s), this.engine.once(P.Closing, o);
    });
  }
  publishOrRepublishTrack(e, t) {
    return m(this, arguments, void 0, function(n, r) {
      var s = this;
      let o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !1, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
      return (function* () {
        var c, d, l, u;
        et(n) && (yield n.setAudioContext(s.audioContext)), yield (c = s.reconnectFuture) === null || c === void 0 ? void 0 : c.promise, s.republishPromise && !o && (yield s.republishPromise), fn(n) && s.pendingPublishPromises.has(n) && (yield s.pendingPublishPromises.get(n));
        let h;
        if (n instanceof MediaStreamTrack)
          h = n.getConstraints();
        else {
          h = n.constraints;
          let w;
          switch (n.source) {
            case C.Source.Microphone:
              w = "audioinput";
              break;
            case C.Source.Camera:
              w = "videoinput";
          }
          w && s.activeDeviceMap.has(w) && (h = Object.assign(Object.assign({}, h), {
            deviceId: s.activeDeviceMap.get(w)
          }));
        }
        if (n instanceof MediaStreamTrack)
          switch (n.kind) {
            case "audio":
              n = new sr(n, h, !0, s.audioContext, {
                loggerName: s.roomOptions.loggerName,
                loggerContextCb: () => s.logContext
              });
              break;
            case "video":
              n = Fi().createTrack(n, h, !0, s.trackLoggerOptions);
              break;
            default:
              throw new st("unsupported MediaStreamTrack kind ".concat(n.kind));
          }
        else
          n.updateLoggerOptions({
            loggerName: s.roomOptions.loggerName,
            loggerContextCb: () => s.logContext
          });
        let f;
        if (s.trackPublications.forEach((w) => {
          w.track && w.track === n && (f = w);
        }), f)
          return s.log.warn("track has already been published, skipping", B(f)), f;
        const g = Object.assign(Object.assign({}, s.roomOptions.publishDefaults), r), p = "channelCount" in n.mediaStreamTrack.getSettings() && // @ts-ignore `channelCount` on getSettings() is currently only available for Safari, but is generally the best way to determine a stereo track https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings/channelCount
        n.mediaStreamTrack.getSettings().channelCount === 2 || n.mediaStreamTrack.getConstraints().channelCount === 2, y = (d = g.forceStereo) !== null && d !== void 0 ? d : p;
        y && (g.dtx === void 0 && s.log.debug("Opus DTX will be disabled for stereo tracks by default. Enable them explicitly to make it work.", B(n)), g.red === void 0 && s.log.debug("Opus RED will be disabled for stereo tracks by default. Enable them explicitly to make it work."), (l = g.dtx) !== null && l !== void 0 || (g.dtx = !1), (u = g.red) !== null && u !== void 0 || (g.red = !1)), g.source && (n.source = g.source);
        const k = new Promise((w, A) => m(s, void 0, void 0, function* () {
          try {
            if (this.engine.client.currentState !== we.CONNECTED) {
              this.log.debug("deferring track publication until signal is connected", {
                track: B(n)
              });
              let b = !1;
              const T = setTimeout(() => {
                b = !0, n.stop(), A(new co("publishing rejected as engine not connected within timeout", 408));
              }, 15e3);
              if (yield this.waitUntilEngineConnected(), clearTimeout(T), b)
                return;
              const S = yield this.publish(n, g, y);
              w(S);
            } else
              try {
                const b = yield this.publish(n, g, y);
                w(b);
              } catch (b) {
                A(b);
              }
          } catch (b) {
            A(b);
          }
        }));
        s.pendingPublishPromises.set(n, k);
        try {
          return yield k;
        } catch (w) {
          if (!a && w instanceof At)
            return s.log.warn("negotiation due to track publish failed, retrying after reconnect", {
              error: w
            }), s.pendingPublishPromises.delete(n), yield s.waitForNextEngineRestart(), yield s.publishOrRepublishTrack(n, r, o, !0);
          throw w;
        } finally {
          s.pendingPublishPromises.delete(n);
        }
      })();
    });
  }
  waitUntilEngineConnected() {
    return this.signalConnectedFuture || (this.signalConnectedFuture = new ye()), this.signalConnectedFuture.promise;
  }
  hasPermissionsToPublish(e) {
    if (!this.permissions)
      return this.log.warn("no permissions present for publishing track", B(e)), !1;
    const t = this.permissions, n = t.canPublish, r = t.canPublishSources;
    return n && (r.length === 0 || r.map((s) => Df(s)).includes(e.source)) ? !0 : (this.log.warn("insufficient permissions to publish", B(e)), !1);
  }
  publish(e, t, n) {
    return m(this, void 0, void 0, function* () {
      var r, s, o, a, c, d, l, u;
      if (!this.hasPermissionsToPublish(e))
        throw new co("failed to publish track, insufficient permissions", 403);
      Array.from(this.trackPublications.values()).find((I) => fn(e) && I.source === e.source) && e.source !== C.Source.Unknown && this.log.info("publishing a second track with the same source: ".concat(e.source), B(e)), t.stopMicTrackOnMute && at(e) && (e.stopOnMute = !0), e.on(R.Muted, this.onTrackMuted), e.on(R.Unmuted, this.onTrackUnmuted), e.on(R.Ended, this.handleTrackEnded), e.on(R.UpstreamPaused, this.onTrackUpstreamPaused), e.on(R.UpstreamResumed, this.onTrackUpstreamResumed), e.on(R.AudioTrackFeatureUpdate, this.onTrackFeatureUpdate);
      const f = [], g = !(!((r = t.dtx) !== null && r !== void 0) || r), p = e.getSourceTrackSettings();
      p.autoGainControl && f.push(ge.TF_AUTO_GAIN_CONTROL), p.echoCancellation && f.push(ge.TF_ECHO_CANCELLATION), p.noiseSuppression && f.push(ge.TF_NOISE_SUPPRESSION), p.channelCount && p.channelCount > 1 && f.push(ge.TF_STEREO), g && f.push(ge.TF_NO_DTX), et(e) && e.hasPreConnectBuffer && f.push(ge.TF_PRECONNECT_BUFFER);
      const y = this.normalizeRequestedFrameMetadataOptions(e, t), k = new si({
        // get local track id for use during publishing
        cid: e.mediaStreamTrack.id,
        name: t.name,
        type: C.kindToProto(e.kind),
        muted: e.isMuted,
        source: C.sourceToProto(e.source),
        disableDtx: g,
        encryption: this.encryptionType,
        stereo: n,
        disableRed: this.isE2EEEnabled || !(!((s = t.red) !== null && s !== void 0) || s),
        stream: t?.stream,
        backupCodecPolicy: t?.backupCodecPolicy,
        audioFeatures: f,
        packetTrailerFeatures: y
      });
      let w;
      if (Fe(e) ? w = yield this.requireVideoPublisher().prepare(e, t, k) : e.kind === C.Kind.Audio && (w = [{
        maxBitrate: (o = t.audioPreset) === null || o === void 0 ? void 0 : o.maxBitrate,
        priority: (c = (a = t.audioPreset) === null || a === void 0 ? void 0 : a.priority) !== null && c !== void 0 ? c : "high",
        networkPriority: (l = (d = t.audioPreset) === null || d === void 0 ? void 0 : d.priority) !== null && l !== void 0 ? l : "high"
      }]), !this.engine || this.engine.isClosed)
        throw new $("cannot publish track when not connected");
      const A = () => m(this, void 0, void 0, function* () {
        var I;
        if (!this.engine.pcManager)
          throw new $("pcManager is not ready");
        if (e.sender = yield this.engine.createSender(e, t, w), Fe(e) && (e.publishOptions = t), this.emit(x.LocalSenderCreated, e.sender, e), Fe(e) && this.requireVideoPublisher().senderCreated(e, t, w, k), w && Qt() && e.kind === C.Kind.Audio) {
          let O;
          for (const U of this.engine.pcManager.publisher.getTransceivers())
            if (U.sender === e.sender) {
              O = U;
              break;
            }
          O && this.engine.pcManager.publisher.setTrackCodecBitrate({
            transceiver: O,
            codec: "opus",
            maxbr: !((I = w[0]) === null || I === void 0) && I.maxBitrate ? w[0].maxBitrate / 1e3 : 0
          });
        }
        yield this.engine.negotiate();
      });
      let b;
      const T = new Promise((I, O) => m(this, void 0, void 0, function* () {
        var U;
        try {
          b = yield this.engine.addTrack(k), I(b);
        } catch (N) {
          if (e.sender && (!((U = this.engine.pcManager) === null || U === void 0) && U.publisher)) {
            try {
              this.engine.pcManager.publisher.removeTrack(e.sender);
            } catch (F) {
              this.log.error(F);
            }
            yield this.engine.negotiate().catch((F) => {
              this.log.error("failed to negotiate after removing track due to failed add track request", Object.assign(Object.assign({}, B(e)), {
                error: F
              }));
            });
          }
          O(N);
        }
      }));
      this.enabledPublishVideoCodecs.length > 0 && y.length === 0 ? b = (yield Promise.all([T, A()]))[0] : (b = yield T, Fe(e) && (w = (u = this.requireVideoPublisher().serverCodecChanged(e, t, b, k)) !== null && u !== void 0 ? u : w), yield A());
      const S = new _s(e.kind, b, e, {
        loggerName: this.roomOptions.loggerName,
        loggerContextCb: () => this.logContext
      });
      if (S.on(R.CpuConstrained, (I) => this.onTrackCpuConstrained(I, S)), S.options = t, e.sid = b.sid, Fe(e) && (e.publishOptions = t, k.width && k.height && (e.lastEncodedDimensions = {
        width: k.width,
        height: k.height
      })), this.log.debug("publishing ".concat(e.kind, " with encodings"), {
        encodings: w,
        trackInfo: b
      }), Fe(e) ? e.startMonitor(this.engine.client) : et(e) && e.startMonitor(), this.addTrackPublication(S), this.emit(x.LocalTrackPublished, S), et(e) && b.audioFeatures.includes(ge.TF_PRECONNECT_BUFFER)) {
        const I = e.getPreConnectBuffer(), O = e.getPreConnectBufferMimeType();
        this.on(x.LocalTrackSubscribed, (U) => {
          if (U.trackSid === b.sid) {
            if (!e.hasPreConnectBuffer) {
              this.log.warn("subscribe event came to late, buffer already closed");
              return;
            }
            this.log.debug("finished recording preconnect buffer", B(e)), e.stopPreConnectBuffer();
          }
        }), I && new Promise((N, F) => m(this, void 0, void 0, function* () {
          var K, Y, Me, Te, ct, le;
          try {
            this.log.debug("waiting for agent", B(e));
            const Tt = setTimeout(() => {
              F(new Error("agent not active within 10 seconds"));
            }, 1e4), Ma = yield this.waitUntilActiveAgentPresent();
            if (clearTimeout(Tt), this.log.debug("sending preconnect buffer", B(e)), !this.slots.byteStreamOpener)
              throw new Error("the dataStreams extension is required to send the preconnect buffer");
            const ci = yield this.slots.byteStreamOpener({
              name: "preconnect-buffer",
              mimeType: O,
              topic: "lk.agent.pre-connect-audio-buffer",
              destinationIdentities: [Ma.identity],
              attributes: {
                trackId: S.trackSid,
                sampleRate: String((ct = p.sampleRate) !== null && ct !== void 0 ? ct : "48000"),
                channels: String((le = p.channelCount) !== null && le !== void 0 ? le : "1")
              }
            });
            try {
              for (var kt = !0, Yt = je(I), Xt; Xt = yield Yt.next(), K = Xt.done, !K; kt = !0) {
                Te = Xt.value, kt = !1;
                const hr = Te;
                yield ci.write(hr);
              }
            } catch (hr) {
              Y = {
                error: hr
              };
            } finally {
              try {
                !kt && !K && (Me = Yt.return) && (yield Me.call(Yt));
              } finally {
                if (Y) throw Y.error;
              }
            }
            yield ci.close(), N();
          } catch (Tt) {
            F(Tt);
          }
        })).then(() => {
          this.log.debug("preconnect buffer sent successfully", B(e));
        }).catch((N) => {
          this.log.error("error sending preconnect buffer", Object.assign(Object.assign({}, B(e)), {
            error: N
          }));
        });
      }
      return S;
    });
  }
  canPublishFrameMetadata() {
    return !!this.engine.e2eeManager || Xn(this.engine.frameMetadataOptions);
  }
  /** @internal */
  normalizeRequestedFrameMetadataOptions(e, t) {
    const n = da(t);
    if (e.kind !== C.Kind.Video || !Ui(n))
      return Pr(t, void 0), [];
    if (!this.canPublishFrameMetadata())
      return this.log.warn("frame metadata transform not supported; not advertising features", Object.assign(Object.assign({}, this.logContext), B(e))), Pr(t, void 0), [];
    const r = wp(n), s = Ep(r);
    return Pr(t, s), r;
  }
  get isLocal() {
    return !0;
  }
  unpublishTrack(e, t) {
    return m(this, void 0, void 0, function* () {
      var n, r;
      if (fn(e)) {
        const l = this.pendingPublishPromises.get(e);
        l && (this.log.debug("awaiting publish promise before attempting to unpublish", B(e)), yield l);
      }
      const s = this.getPublicationForTrack(e), o = s ? B(s) : void 0;
      if (this.log.info("unpublishing track", o), !s || !s.track) {
        this.log.warn("track was not unpublished because no publication was found", o);
        return;
      }
      e = s.track, e.off(R.Muted, this.onTrackMuted), e.off(R.Unmuted, this.onTrackUnmuted), e.off(R.Ended, this.handleTrackEnded), e.off(R.UpstreamPaused, this.onTrackUpstreamPaused), e.off(R.UpstreamResumed, this.onTrackUpstreamResumed), e.off(R.AudioTrackFeatureUpdate, this.onTrackFeatureUpdate), t === void 0 && (t = (r = (n = this.roomOptions) === null || n === void 0 ? void 0 : n.stopLocalTrackOnUnpublish) !== null && r !== void 0 ? r : !0), t ? e.stop() : e.stopMonitor();
      let a = !1;
      const c = e.sender;
      if (e.sender = void 0, this.engine.pcManager && this.engine.pcManager.currentState < X.FAILED && c)
        try {
          for (const l of this.engine.pcManager.publisher.getTransceivers())
            l.sender === c && (l.direction = "inactive", a = !0);
          try {
            a = this.engine.removeTrack(c);
          } catch (l) {
            this.log.warn(l), a = !0;
          }
          if (Fe(e)) {
            for (const l of e.simulcastCodecs) {
              var d = L(l, 2);
              const u = d[1];
              if (u.sender) {
                try {
                  a = this.engine.removeTrack(u.sender);
                } catch (h) {
                  this.log.warn(h), a = !0;
                }
                u.sender = void 0;
              }
            }
            e.simulcastCodecs.clear();
          }
        } catch (l) {
          this.log.warn("failed to unpublish track", Object.assign(Object.assign({}, o), {
            error: l
          }));
        }
      switch (this.trackPublications.delete(s.trackSid), s.kind) {
        case C.Kind.Audio:
          this.audioTrackPublications.delete(s.trackSid);
          break;
        case C.Kind.Video:
          this.videoTrackPublications.delete(s.trackSid);
          break;
      }
      return this.emit(x.LocalTrackUnpublished, s), s.setTrack(void 0), a && (yield this.engine.negotiate()), s;
    });
  }
  unpublishTracks(e) {
    return m(this, void 0, void 0, function* () {
      return (yield Promise.all(e.map((n) => this.unpublishTrack(n)))).filter((n) => !!n);
    });
  }
  republishAllTracks(e) {
    return m(this, arguments, void 0, function(t) {
      var n = this;
      let r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
      return (function* () {
        n.republishPromise && (yield n.republishPromise), n.republishPromise = new Ee((s, o) => m(n, void 0, void 0, function* () {
          try {
            const a = [];
            this.trackPublications.forEach((c) => {
              c.track && (t && (c.options = Object.assign(Object.assign({}, c.options), t)), a.push(c));
            }), yield Promise.all(a.map((c) => m(this, void 0, void 0, function* () {
              const d = c.track;
              yield this.unpublishTrack(d, !1), r && !d.isMuted && d.source !== C.Source.ScreenShare && d.source !== C.Source.ScreenShareAudio && (et(d) || Fe(d)) && !d.isUserProvided && (this.log.debug("restarting existing track", {
                track: c.trackSid
              }), yield d.restartTrack()), yield this.publishOrRepublishTrack(d, c.options, !0);
            }))), s();
          } catch (a) {
            a instanceof Error ? o(a) : o(new Error(String(a)));
          } finally {
            this.republishPromise = void 0;
          }
        })), yield n.republishPromise;
      })();
    });
  }
  /**
   * Publish a new data payload to the room. Data will be forwarded to each
   * participant in the room if the destination field in publishOptions is empty
   *
   * @param data Uint8Array of the payload. To send string data, use TextEncoder.encode
   * @param options optionally specify a `reliable`, `topic` and `destination`
   */
  publishData(e) {
    return m(this, arguments, void 0, function(t) {
      var n = this;
      let r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return (function* () {
        const s = r.reliable ? j.RELIABLE : j.LOSSY, o = r.reliable ? It.RELIABLE : It.LOSSY, a = r.destinationIdentities, c = r.topic;
        let d = new Hs({
          participantIdentity: n.identity,
          payload: t,
          destinationIdentities: a,
          topic: c
        });
        const l = new Ae({
          kind: o,
          value: {
            case: "user",
            value: d
          }
        });
        yield n.engine.sendDataPacket(l, s);
      })();
    });
  }
  /**
   * Publish SIP DTMF message to the room.
   *
   * @param code DTMF code
   * @param digit DTMF digit
   */
  publishDtmf(e, t) {
    return m(this, void 0, void 0, function* () {
      const n = new Ae({
        kind: It.RELIABLE,
        value: {
          case: "sipDtmf",
          value: new Ed({
            code: e,
            digit: t
          })
        }
      });
      yield this.engine.sendDataPacket(n, j.RELIABLE);
    });
  }
  /**
   * Control who can subscribe to LocalParticipant's published tracks.
   *
   * By default, all participants can subscribe. This allows fine-grained control over
   * who is able to subscribe at a participant and track level.
   *
   * Note: if access is given at a track-level (i.e. both [allParticipantsAllowed] and
   * [ParticipantTrackPermission.allTracksAllowed] are false), any newer published tracks
   * will not grant permissions to any participants and will require a subsequent
   * permissions update to allow subscription.
   *
   * @param allParticipantsAllowed Allows all participants to subscribe all tracks.
   *  Takes precedence over [[participantTrackPermissions]] if set to true.
   *  By default this is set to true.
   * @param participantTrackPermissions Full list of individual permissions per
   *  participant/track. Any omitted participants will not receive any permissions.
   */
  setTrackSubscriptionPermissions(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
    this.participantTrackPermissions = t, this.allParticipantsAllowedToSubscribe = e, this.engine.client.isDisconnected || this.updateTrackSubscriptionPermissions();
  }
  /** @internal */
  setEnabledPublishCodecs(e) {
    this.enabledPublishVideoCodecs = e.filter((t) => t.mime.split("/")[0].toLowerCase() === "video");
  }
  /** @internal */
  updateInfo(e) {
    return super.updateInfo(e) ? (e.tracks.forEach((t) => {
      var n, r;
      const s = this.trackPublications.get(t.sid);
      if (s) {
        const o = s.isMuted || ((r = (n = s.track) === null || n === void 0 ? void 0 : n.isUpstreamPaused) !== null && r !== void 0 ? r : !1);
        o !== t.muted && (this.log.debug("updating server mute state after reconcile", Object.assign(Object.assign({}, B(s)), {
          mutedOnServer: o
        })), this.engine.client.sendMuteTrack(t.sid, o));
      }
    }), !0) : !1;
  }
  /** @internal */
  setActiveAgent(e) {
    var t, n, r, s;
    this.firstActiveAgent = e, e && !this.firstActiveAgent && (this.firstActiveAgent = e), e ? (n = (t = this.activeAgentFuture) === null || t === void 0 ? void 0 : t.resolve) === null || n === void 0 || n.call(t, e) : (s = (r = this.activeAgentFuture) === null || r === void 0 ? void 0 : r.reject) === null || s === void 0 || s.call(r, new Error("Agent disconnected")), this.activeAgentFuture = void 0;
  }
  waitUntilActiveAgentPresent() {
    return this.firstActiveAgent ? Promise.resolve(this.firstActiveAgent) : (this.activeAgentFuture || (this.activeAgentFuture = new ye()), this.activeAgentFuture.promise);
  }
  /**
   * @internal
   */
  restartOnDefaultAudioDevice(e) {
    return m(this, void 0, void 0, function* () {
      var t, n;
      try {
        ir() ? yield e.setDeviceId({
          exact: "default"
        }) : yield e.restartTrack();
      } catch (r) {
        if (!np(r) || ep(r) || e.isStopped)
          throw r;
        this.log.debug("could not reacquire the audio device, retrying with an enumerated device", B(e));
        const s = yield he.getInstance().getDevices("audioinput", !1);
        yield e.setDeviceId((n = (t = s?.[0]) === null || t === void 0 ? void 0 : t.deviceId) !== null && n !== void 0 ? n : "default");
      }
    });
  }
  getPublicationForTrack(e) {
    let t;
    return this.trackPublications.forEach((n) => {
      const r = n.track;
      r && (e instanceof MediaStreamTrack ? (et(r) || Fe(r)) && r.mediaStreamTrack === e && (t = n) : e === r && (t = n));
    }), t;
  }
  waitForPendingPublicationOfSource(e) {
    return m(this, void 0, void 0, function* () {
      const n = Date.now();
      for (; Date.now() < n + 1e4; ) {
        const r = Array.from(this.pendingPublishPromises.entries()).find((s) => L(s, 1)[0].source === e);
        if (r)
          return r[1];
        yield be(20);
      }
    });
  }
}
class Vo extends DOMException {
  constructor(e, t) {
    super(e, "AbortError"), this.reason = t;
  }
}
class Jm extends Map {
  constructor() {
    super(...arguments), this.pending = /* @__PURE__ */ new Map();
  }
  set(e, t) {
    var n, r;
    super.set(e, t);
    const s = (n = this.pending) === null || n === void 0 ? void 0 : n.get(e);
    if (s) {
      for (const o of s)
        o.isResolved || (r = o.resolve) === null || r === void 0 || r.call(o, t);
      this.pending.delete(e);
    }
    return this;
  }
  get [Symbol.toStringTag]() {
    return "DeferrableMap";
  }
  getDeferred(e, t) {
    return m(this, void 0, void 0, function* () {
      const n = this.get(e);
      if (typeof n < "u")
        return n;
      if (t?.aborted)
        throw new Vo("The operation was aborted.", t.reason);
      const r = new ye(void 0, () => {
        const o = this.pending.get(e);
        if (!o)
          return;
        const a = o.indexOf(r);
        a !== -1 && o.splice(a, 1), o.length === 0 && this.pending.delete(e);
      }), s = this.pending.get(e);
      if (s ? s.push(r) : this.pending.set(e, [r]), t) {
        const o = () => {
          var c;
          r.isResolved || (c = r.reject) === null || c === void 0 || c.call(r, new Vo("The operation was aborted.", t.reason));
        };
        t.addEventListener("abort", o, {
          once: !0
        });
        const a = () => {
          t.removeEventListener("abort", o);
        };
        r.promise.then(a, a);
      }
      return r.promise;
    });
  }
}
class $m extends ht {
  constructor(e, t, n, r) {
    super(e, t.sid, t.name, r), this.track = void 0, this.allowed = !0, this.requestedDisabled = void 0, this.visible = !0, this.handleEnded = (s) => {
      this.setTrack(void 0), this.emit(R.Ended, s);
    }, this.handleVisibilityChange = (s) => {
      this.log.debug("adaptivestream video visibility ".concat(this.trackSid, ", visible=").concat(s), this.logContext), this.visible = s, this.emitTrackUpdate();
    }, this.handleVideoDimensionsChange = (s) => {
      this.log.debug("adaptivestream video dimensions ".concat(s.width, "x").concat(s.height), this.logContext), this.videoDimensionsAdaptiveStream = s, this.emitTrackUpdate();
    }, this.subscribed = n, this.updateInfo(t);
  }
  /**
   * Subscribe or unsubscribe to this remote track
   * @param subscribed true to subscribe to a track, false to unsubscribe
   */
  setSubscribed(e) {
    const t = this.subscriptionStatus, n = this.permissionStatus;
    this.subscribed = e, e && (this.allowed = !0);
    const r = new er({
      trackSids: [this.trackSid],
      subscribe: this.subscribed,
      participantTracks: [new Pd({
        // sending an empty participant id since TrackPublication doesn't keep it
        // this is filled in by the participant that receives this message
        participantSid: "",
        trackSids: [this.trackSid]
      })]
    });
    this.emit(R.UpdateSubscription, r), this.emitSubscriptionUpdateIfChanged(t), this.emitPermissionUpdateIfChanged(n);
  }
  get subscriptionStatus() {
    return this.subscribed === !1 ? ht.SubscriptionStatus.Unsubscribed : super.isSubscribed ? ht.SubscriptionStatus.Subscribed : ht.SubscriptionStatus.Desired;
  }
  get permissionStatus() {
    return this.allowed ? ht.PermissionStatus.Allowed : ht.PermissionStatus.NotAllowed;
  }
  /**
   * Returns true if track is subscribed, and ready for playback
   */
  get isSubscribed() {
    return this.subscribed === !1 ? !1 : super.isSubscribed;
  }
  // returns client's desire to subscribe to a track, also true if autoSubscribe is enabled
  get isDesired() {
    return this.subscribed !== !1;
  }
  get isEnabled() {
    return this.requestedDisabled !== void 0 ? !this.requestedDisabled : this.isAdaptiveStream ? this.visible : !0;
  }
  get isLocal() {
    return !1;
  }
  /**
   * disable server from sending down data for this track. this is useful when
   * the participant is off screen, you may disable streaming down their video
   * to reduce bandwidth requirements
   * @param enabled
   */
  setEnabled(e) {
    !this.isManualOperationAllowed() || this.requestedDisabled === !e || (this.requestedDisabled = !e, this.emitTrackUpdate());
  }
  /**
   * for tracks that support simulcasting, adjust subscribed quality
   *
   * This indicates the highest quality the client can accept. if network
   * bandwidth does not allow, server will automatically reduce quality to
   * optimize for uninterrupted video
   */
  setVideoQuality(e) {
    !this.isManualOperationAllowed() || this.requestedMaxQuality === e || (this.requestedMaxQuality = e, this.requestedVideoDimensions = void 0, this.emitTrackUpdate());
  }
  /**
   * Explicitly set the video dimensions for this track.
   *
   * With adaptive stream, the SDK requests the smaller of these and the adaptive stream dimensions
   * (by pixel count).
   * It clears a quality that was requested with `setVideoQuality()`.
   *
   * @param dimensions The video dimensions to set.
   */
  setVideoDimensions(e) {
    var t, n;
    this.isManualOperationAllowed() && (((t = this.requestedVideoDimensions) === null || t === void 0 ? void 0 : t.width) === e.width && ((n = this.requestedVideoDimensions) === null || n === void 0 ? void 0 : n.height) === e.height || (Er(this.track) && (this.requestedVideoDimensions = e), this.requestedMaxQuality = void 0, this.emitTrackUpdate()));
  }
  setVideoFPS(e) {
    this.isManualOperationAllowed() && Er(this.track) && this.fps !== e && (this.fps = e, this.emitTrackUpdate());
  }
  /**
   * The maximum video quality that was requested with `setVideoQuality()`.
   * When no quality was requested, it is `VideoQuality.HIGH`. `setVideoDimensions()` clears the
   * requested quality, so it is `VideoQuality.HIGH` after that call too.
   *
   * This value does not show the layer that the server sends. Adaptive stream and network
   * bandwidth can make the server send a lower layer, and this value does not change.
   *
   * @see `RemoteVideoTrack.getReceiverStats()` (`frameWidth` and `frameHeight`) for the size of
   * the video that the client receives.
   */
  get videoQuality() {
    var e;
    return (e = this.requestedMaxQuality) !== null && e !== void 0 ? e : De.HIGH;
  }
  /** @internal */
  setTrack(e) {
    const t = this.subscriptionStatus, n = this.permissionStatus, r = this.track;
    r !== e && (r && (r.off(R.VideoDimensionsChanged, this.handleVideoDimensionsChange), r.off(R.VisibilityChanged, this.handleVisibilityChange), r.off(R.Ended, this.handleEnded), r.detach(), r.stopMonitor(), this.emit(R.Unsubscribed, r)), super.setTrack(e), e && (e.sid = this.trackSid, e.on(R.VideoDimensionsChanged, this.handleVideoDimensionsChange), e.on(R.VisibilityChanged, this.handleVisibilityChange), e.on(R.Ended, this.handleEnded), this.emit(R.Subscribed, e)), this.emitPermissionUpdateIfChanged(n), this.emitSubscriptionUpdateIfChanged(t));
  }
  /** @internal */
  setAllowed(e) {
    const t = this.subscriptionStatus, n = this.permissionStatus;
    this.allowed = e, this.emitPermissionUpdateIfChanged(n), this.emitSubscriptionUpdateIfChanged(t);
  }
  /** @internal */
  setSubscriptionError(e) {
    this.emit(R.SubscriptionFailed, e);
  }
  /** @internal */
  updateInfo(e) {
    super.updateInfo(e);
    const t = this.metadataMuted;
    this.metadataMuted = e.muted, this.track ? this.track.setMuted(e.muted) : t !== e.muted && this.emit(e.muted ? R.Muted : R.Unmuted);
  }
  emitSubscriptionUpdateIfChanged(e) {
    const t = this.subscriptionStatus;
    e !== t && this.emit(R.SubscriptionStatusChanged, t, e);
  }
  emitPermissionUpdateIfChanged(e) {
    this.permissionStatus !== e && this.emit(R.SubscriptionPermissionChanged, this.permissionStatus, e);
  }
  isManualOperationAllowed() {
    return this.isDesired ? !0 : (this.log.warn("cannot update track settings when not subscribed", this.logContext), !1);
  }
  get isAdaptiveStream() {
    return Er(this.track) && this.track.isAdaptiveStream;
  }
  /* @internal */
  emitTrackUpdate() {
    const e = new Ud({
      trackSids: [this.trackSid],
      disabled: !this.isEnabled,
      fps: this.fps
    });
    if (this.kind === C.Kind.Video) {
      let t = this.requestedVideoDimensions;
      if (this.videoDimensionsAdaptiveStream !== void 0)
        if (t)
          uo(this.videoDimensionsAdaptiveStream, t) && (this.log.debug("using adaptive stream dimensions instead of requested", Object.assign(Object.assign({}, this.logContext), this.videoDimensionsAdaptiveStream)), t = this.videoDimensionsAdaptiveStream);
        else if (this.requestedMaxQuality !== void 0 && this.trackInfo) {
          const n = Nf(this.trackInfo, this.requestedMaxQuality);
          n && uo(this.videoDimensionsAdaptiveStream, n) && (this.log.debug("using adaptive stream dimensions instead of max quality layer", Object.assign(Object.assign({}, this.logContext), this.videoDimensionsAdaptiveStream)), t = this.videoDimensionsAdaptiveStream);
        } else
          this.log.debug("using adaptive stream dimensions", Object.assign(Object.assign({}, this.logContext), this.videoDimensionsAdaptiveStream)), t = this.videoDimensionsAdaptiveStream;
      t ? (e.width = Math.ceil(t.width), e.height = Math.ceil(t.height)) : this.requestedMaxQuality !== void 0 ? (this.log.debug("using requested max quality", Object.assign(Object.assign({}, this.logContext), {
        quality: this.requestedMaxQuality
      })), e.quality = this.requestedMaxQuality) : (this.log.debug("using default quality", Object.assign(Object.assign({}, this.logContext), {
        quality: De.HIGH
      })), e.quality = De.HIGH);
    }
    this.emit(R.UpdateSettings, e);
  }
}
const Nr = 100;
class ya extends kl {
  constructor(e, t, n, r, s) {
    super(e, t, C.Kind.Video, n, s), this.elementInfos = [], this.monitorReceiver = () => m(this, void 0, void 0, function* () {
      if (!this.receiver) {
        this._currentBitrate = 0;
        return;
      }
      const o = yield this.getReceiverStats();
      o && this.prevStats && this.receiver && (this._currentBitrate = rr(o, this.prevStats)), this.prevStats = o;
    }), this.debouncedHandleResize = fa(() => {
      this.updateDimensions();
    }, Nr), this.adaptiveStreamSettings = r;
  }
  get isAdaptiveStream() {
    return this.adaptiveStreamSettings !== void 0;
  }
  /**
   * Look up frame-level metadata for a given RTP timestamp.
   * Use with the `TrackEvent.TimeSyncUpdate` event to correlate displayed frames
   * with their capture-time metadata.
   *
   * Requires the room to be configured with the `frameMetadata` worker option
   * and the publishing track to have frame metadata features enabled.
   *
   */
  lookupFrameMetadata(e) {
    let t = e.rtpTimestamp;
    var n;
    return (n = this.frameMetadataExtractor) === null || n === void 0 ? void 0 : n.lookupMetadata(t);
  }
  setStreamState(e) {
    super.setStreamState(e), this.log.debug("setStreamState", e), this.isAdaptiveStream && e === C.StreamState.Active && this.updateVisibility();
  }
  /**
   * Note: When using adaptiveStream, you need to use remoteVideoTrack.attach() to add the track to a HTMLVideoElement, otherwise your video tracks might never start
   */
  get mediaStreamTrack() {
    return this._mediaStreamTrack;
  }
  /** @internal */
  setMuted(e) {
    super.setMuted(e), this.attachedElements.forEach((t) => {
      e ? dn(this._mediaStreamTrack, t) : sn(this._mediaStreamTrack, t);
    });
  }
  attach(e) {
    if (e ? super.attach(e) : e = super.attach(), this.adaptiveStreamSettings && this.elementInfos.find((t) => t.element === e) === void 0) {
      const t = new Qm(e);
      this.observeElementInfo(t);
    }
    return e;
  }
  /**
   * Observe an ElementInfo for changes when adaptive streaming.
   * @param elementInfo
   * @internal
   */
  observeElementInfo(e) {
    this.adaptiveStreamSettings && this.elementInfos.find((t) => t === e) === void 0 ? (e.handleResize = () => {
      this.debouncedHandleResize();
    }, e.handleVisibilityChanged = () => {
      this.updateVisibility();
    }, this.elementInfos.push(e), e.observe(), this.debouncedHandleResize(), this.updateVisibility()) : this.log.warn("visibility resize observer not triggered", this.logContext);
  }
  /**
   * Stop observing an ElementInfo for changes.
   * @param elementInfo
   * @internal
   */
  stopObservingElementInfo(e) {
    if (!this.isAdaptiveStream) {
      this.log.warn("stopObservingElementInfo ignored", this.logContext);
      return;
    }
    const t = this.elementInfos.filter((n) => n === e);
    for (const n of t)
      n.stopObserving();
    this.elementInfos = this.elementInfos.filter((n) => n !== e), this.updateVisibility(), this.debouncedHandleResize();
  }
  detach(e) {
    if (e)
      return this.stopObservingElement(e), super.detach(e);
    const t = super.detach();
    for (const n of t)
      this.stopObservingElement(n);
    return t;
  }
  /** @internal */
  getDecoderImplementation() {
    var e;
    return (e = this.prevStats) === null || e === void 0 ? void 0 : e.decoderImplementation;
  }
  getReceiverStats() {
    return m(this, void 0, void 0, function* () {
      if (!this.receiver || !this.receiver.getStats)
        return;
      const e = yield this.receiver.getStats();
      let t, n = "", r = /* @__PURE__ */ new Map();
      return e.forEach((s) => {
        s.type === "inbound-rtp" ? (n = s.codecId, t = {
          type: "video",
          streamId: s.id,
          framesDecoded: s.framesDecoded,
          framesDropped: s.framesDropped,
          framesReceived: s.framesReceived,
          packetsReceived: s.packetsReceived,
          packetsLost: s.packetsLost,
          frameWidth: s.frameWidth,
          frameHeight: s.frameHeight,
          pliCount: s.pliCount,
          firCount: s.firCount,
          nackCount: s.nackCount,
          jitter: s.jitter,
          timestamp: s.timestamp,
          bytesReceived: s.bytesReceived,
          decoderImplementation: s.decoderImplementation
        }) : s.type === "codec" && r.set(s.id, s);
      }), t && n !== "" && r.get(n) && (t.mimeType = r.get(n).mimeType), t;
    });
  }
  stopObservingElement(e) {
    const t = this.elementInfos.filter((n) => n.element === e);
    for (const n of t)
      this.stopObservingElementInfo(n);
  }
  handleAppVisibilityChanged() {
    const e = Object.create(null, {
      handleAppVisibilityChanged: {
        get: () => super.handleAppVisibilityChanged
      }
    });
    return m(this, void 0, void 0, function* () {
      yield e.handleAppVisibilityChanged.call(this), this.isAdaptiveStream && this.updateVisibility();
    });
  }
  updateVisibility(e) {
    var t, n;
    const r = this.elementInfos.reduce((c, d) => Math.max(c, d.visibilityChangedAt || 0), 0), s = !((n = (t = this.adaptiveStreamSettings) === null || t === void 0 ? void 0 : t.pauseVideoInBackground) !== null && n !== void 0) || n ? this.isInBackground : !1, o = this.elementInfos.some((c) => c.pictureInPicture), a = this.elementInfos.some((c) => c.visible) && !s || o;
    if (!(this.lastVisible === a && !e)) {
      if (!a && Date.now() - r < Nr) {
        z.setTimeout(() => {
          this.updateVisibility();
        }, Nr);
        return;
      }
      this.lastVisible = a, this.emit(R.VisibilityChanged, a, this);
    }
  }
  updateDimensions() {
    var e, t;
    let n = 0, r = 0;
    const s = this.getPixelDensity();
    for (const o of this.elementInfos) {
      const a = o.width() * s, c = o.height() * s;
      a + c > n + r && (n = a, r = c);
    }
    ((e = this.lastDimensions) === null || e === void 0 ? void 0 : e.width) === n && ((t = this.lastDimensions) === null || t === void 0 ? void 0 : t.height) === r || (this.lastDimensions = {
      width: n,
      height: r
    }, this.emit(R.VideoDimensionsChanged, this.lastDimensions, this));
  }
  getPixelDensity() {
    var e;
    const t = (e = this.adaptiveStreamSettings) === null || e === void 0 ? void 0 : e.pixelDensity;
    return t === "screen" ? ho() : t || (ho() > 2 ? 2 : 1);
  }
}
class Qm {
  get visible() {
    return this.isPiP || this.isIntersecting;
  }
  get pictureInPicture() {
    return this.isPiP;
  }
  constructor(e, t) {
    this.onVisibilityChanged = (n) => {
      var r;
      const s = n.target, o = n.isIntersecting;
      s === this.element && (this.isIntersecting = o, this.isPiP = Mn(this.element), this.visibilityChangedAt = Date.now(), (r = this.handleVisibilityChanged) === null || r === void 0 || r.call(this));
    }, this.onEnterPiP = () => {
      var n, r;
      (r = (n = window.documentPictureInPicture) === null || n === void 0 ? void 0 : n.window) === null || r === void 0 || r.addEventListener("pagehide", this.onLeavePiP), queueMicrotask(() => {
        requestAnimationFrame(() => {
          var s;
          this.isPiP = Mn(this.element), (s = this.handleVisibilityChanged) === null || s === void 0 || s.call(this);
        });
      });
    }, this.onLeavePiP = () => {
      var n;
      this.isPiP = Mn(this.element), (n = this.handleVisibilityChanged) === null || n === void 0 || n.call(this);
    }, this.element = e, this.isIntersecting = t ?? Rs(e), this.isPiP = _e() && Mn(e), this.visibilityChangedAt = 0;
  }
  width() {
    return this.element.clientWidth;
  }
  height() {
    return this.element.clientHeight;
  }
  observe() {
    var e, t, n;
    this.isIntersecting = Rs(this.element), this.isPiP = Mn(this.element), this.element.handleResize = () => {
      var r;
      (r = this.handleResize) === null || r === void 0 || r.call(this);
    }, this.element.handleVisibilityChanged = this.onVisibilityChanged, po().observe(this.element), fo().observe(this.element), this.element.addEventListener("enterpictureinpicture", this.onEnterPiP), this.element.addEventListener("leavepictureinpicture", this.onLeavePiP), (e = window.documentPictureInPicture) === null || e === void 0 || e.addEventListener("enter", this.onEnterPiP), (n = (t = window.documentPictureInPicture) === null || t === void 0 ? void 0 : t.window) === null || n === void 0 || n.addEventListener("pagehide", this.onLeavePiP);
  }
  stopObserving() {
    var e, t, n, r, s;
    (e = po()) === null || e === void 0 || e.unobserve(this.element), (t = fo()) === null || t === void 0 || t.unobserve(this.element), this.element.removeEventListener("enterpictureinpicture", this.onEnterPiP), this.element.removeEventListener("leavepictureinpicture", this.onLeavePiP), (n = window.documentPictureInPicture) === null || n === void 0 || n.removeEventListener("enter", this.onEnterPiP), (s = (r = window.documentPictureInPicture) === null || r === void 0 ? void 0 : r.window) === null || s === void 0 || s.removeEventListener("pagehide", this.onLeavePiP);
  }
}
function Mn(i) {
  var e;
  if (document.pictureInPictureElement === i) return !0;
  const t = (e = window.documentPictureInPicture) === null || e === void 0 ? void 0 : e.window;
  return t ? Ym(i.ownerDocument, t) && Rs(i, t) : !1;
}
function Ym(i, e) {
  var t, n, r;
  if (((t = i.defaultView) === null || t === void 0 ? void 0 : t.top) === e) return !0;
  let s = i;
  for (; s; ) {
    if (s === e.document) return !0;
    try {
      s = (r = (n = s.defaultView) === null || n === void 0 ? void 0 : n.frameElement) === null || r === void 0 ? void 0 : r.ownerDocument;
    } catch {
      return !1;
    }
  }
  return !1;
}
function Rs(i, e) {
  const t = e || window;
  let n = i.offsetTop, r = i.offsetLeft;
  const s = i.offsetWidth, o = i.offsetHeight, a = i, c = a.hidden, d = getComputedStyle(i), l = d.display;
  for (; i.offsetParent; )
    i = i.offsetParent, n += i.offsetTop, r += i.offsetLeft;
  return n < t.pageYOffset + t.innerHeight && r < t.pageXOffset + t.innerWidth && n + o > t.pageYOffset && r + s > t.pageXOffset && !c && l !== "none";
}
class Bi extends Tl {
  /** @internal */
  static fromParticipantInfo(e, t, n) {
    return new Bi(e, t.sid, t.identity, t.name, t.metadata, t.attributes, n, t.kind, [], t.clientProtocol, t.capabilities);
  }
  get logContext() {
    return Object.assign(Object.assign({}, super.logContext), {
      remoteParticipantID: this.sid,
      remoteParticipant: this.identity
    });
  }
  /** @internal */
  constructor(e, t, n, r, s, o, a) {
    let c = arguments.length > 7 && arguments[7] !== void 0 ? arguments[7] : Gn.STANDARD, d = arguments.length > 8 && arguments[8] !== void 0 ? arguments[8] : [], l = arguments.length > 9 && arguments[9] !== void 0 ? arguments[9] : ra, u = arguments.length > 10 && arguments[10] !== void 0 ? arguments[10] : [];
    super(t, n || "", r, s, o, a, c), this.signalClient = e, this.trackPublications = /* @__PURE__ */ new Map(), this.audioTrackPublications = /* @__PURE__ */ new Map(), this.videoTrackPublications = /* @__PURE__ */ new Map(), this.dataTracks = new Jm(d.map((h) => [h.info.name, h])), this.volumeMap = /* @__PURE__ */ new Map(), this.clientProtocol = l, this.capabilities = u;
  }
  addTrackPublication(e) {
    super.addTrackPublication(e), e.on(R.UpdateSettings, (t) => {
      this.log.debug("send update settings", Object.assign(Object.assign(Object.assign({}, this.logContext), B(e)), {
        settings: t
      })), this.signalClient.sendUpdateTrackSettings(t);
    }), e.on(R.UpdateSubscription, (t) => {
      t.participantTracks.forEach((n) => {
        n.participantSid = this.sid;
      }), this.signalClient.sendUpdateSubscription(t);
    }), e.on(R.SubscriptionPermissionChanged, (t) => {
      this.emit(x.TrackSubscriptionPermissionChanged, e, t);
    }), e.on(R.SubscriptionStatusChanged, (t) => {
      this.emit(x.TrackSubscriptionStatusChanged, e, t);
    }), e.on(R.Subscribed, (t) => {
      this.emit(x.TrackSubscribed, t, e);
    }), e.on(R.Unsubscribed, (t) => {
      this.emit(x.TrackUnsubscribed, t, e);
    }), e.on(R.SubscriptionFailed, (t) => {
      this.emit(x.TrackSubscriptionFailed, e.trackSid, t);
    });
  }
  getTrackPublication(e) {
    const t = super.getTrackPublication(e);
    if (t)
      return t;
  }
  getTrackPublicationByName(e) {
    const t = super.getTrackPublicationByName(e);
    if (t)
      return t;
  }
  /**
   * sets the volume on the participant's audio track
   * by default, this affects the microphone publication
   * a different source can be passed in as a second argument
   * if no track exists the volume will be applied when the microphone track is added
   */
  setVolume(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : C.Source.Microphone;
    this.volumeMap.set(t, e);
    const n = this.getTrackPublication(t);
    n && n.track && n.track.setVolume(e);
  }
  /**
   * gets the volume on the participant's microphone track
   */
  getVolume() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : C.Source.Microphone;
    const t = this.getTrackPublication(e);
    return t && t.track ? t.track.getVolume() : this.volumeMap.get(e);
  }
  /** @internal */
  addSubscribedMediaTrack(e, t, n, r, s, o) {
    let a = this.getTrackPublicationBySid(t);
    if (a || t.startsWith("TR") || this.trackPublications.forEach((l) => {
      !a && e.kind === l.kind.toString() && (a = l);
    }), !a) {
      if (o === 0) {
        this.log.error("could not find published track", Object.assign(Object.assign({}, this.logContext), {
          trackSid: t
        })), this.emit(x.TrackSubscriptionFailed, t);
        return;
      }
      o === void 0 && (o = 20), setTimeout(() => {
        this.addSubscribedMediaTrack(e, t, n, r, s, o - 1);
      }, 150);
      return;
    }
    if (e.readyState === "ended") {
      this.log.error("unable to subscribe because MediaStreamTrack is ended. Do not call MediaStreamTrack.stop()", Object.assign(Object.assign({}, this.logContext), B(a))), this.emit(x.TrackSubscriptionFailed, t);
      return;
    }
    const c = e.kind === "video";
    let d;
    return c ? d = new ya(e, t, r, s) : d = new Wm(e, t, r, this.audioContext, this.audioOutput), d.source = a.source, d.isMuted = a.isMuted, d.setMediaStream(n), d.start(), a.setTrack(d), this.volumeMap.has(a.source) && Ts(d) && at(d) && d.setVolume(this.volumeMap.get(a.source)), a;
  }
  /** @internal */
  get hasMetadata() {
    return !!this.participantInfo;
  }
  /**
   * @internal
   */
  getTrackPublicationBySid(e) {
    return this.trackPublications.get(e);
  }
  /** @internal */
  updateInfo(e) {
    if (!super.updateInfo(e))
      return !1;
    const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
    return e.tracks.forEach((r) => {
      var s, o;
      let a = this.getTrackPublicationBySid(r.sid);
      if (a)
        a.updateInfo(r);
      else {
        const c = C.kindFromProto(r.type);
        if (!c)
          return;
        a = new $m(c, r, (s = this.signalClient.connectOptions) === null || s === void 0 ? void 0 : s.autoSubscribe, {
          loggerContextCb: () => this.logContext,
          loggerName: (o = this.loggerOptions) === null || o === void 0 ? void 0 : o.loggerName
        }), a.updateInfo(r), n.set(r.sid, a);
        const d = Array.from(this.trackPublications.values()).find((l) => l.source === a?.source);
        d && a.source !== C.Source.Unknown && this.log.debug("received a second track publication for ".concat(this.identity, " with the same source: ").concat(a.source), Object.assign(Object.assign({}, this.logContext), {
          oldTrack: B(d),
          newTrack: B(a)
        })), this.addTrackPublication(a);
      }
      t.set(r.sid, a);
    }), this.trackPublications.forEach((r) => {
      t.has(r.trackSid) || (this.log.trace("detected removed track on remote participant, unpublishing", Object.assign(Object.assign({}, this.logContext), B(r))), this.unpublishTrack(r.trackSid, !0));
    }), n.forEach((r) => {
      this.emit(x.TrackPublished, r);
    }), !0;
  }
  /** @internal */
  unpublishTrack(e, t) {
    const n = this.trackPublications.get(e);
    if (!n)
      return;
    const r = n.track;
    switch (r && (r.stop(), n.setTrack(void 0)), this.trackPublications.delete(e), n.kind) {
      case C.Kind.Audio:
        this.audioTrackPublications.delete(e);
        break;
      case C.Kind.Video:
        this.videoTrackPublications.delete(e);
        break;
    }
    t && this.emit(x.TrackUnpublished, n);
  }
  /**
   * @internal
   */
  setAudioOutput(e) {
    return m(this, void 0, void 0, function* () {
      this.audioOutput = e;
      const t = [];
      this.audioTrackPublications.forEach((n) => {
        var r;
        at(n.track) && Ts(n.track) && t.push(n.track.setSinkId((r = e.deviceId) !== null && r !== void 0 ? r : "default"));
      }), yield Promise.all(t);
    });
  }
  /** @internal */
  addRemoteDataTrack(e) {
    this.dataTracks.set(e.info.name, e);
  }
  /** @internal */
  removeRemoteDataTrack(e) {
    for (const n of this.dataTracks.entries()) {
      var t = L(n, 2);
      const r = t[0], s = t[1];
      e === s.info.sid && this.dataTracks.delete(r);
    }
  }
  /** @internal */
  emit(e) {
    for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++)
      n[r - 1] = arguments[r];
    return this.log.trace("participant event", Object.assign(Object.assign({}, this.logContext), {
      event: e,
      args: n
    })), super.emit(e, ...n);
  }
}
var V;
(function(i) {
  i.Disconnected = "disconnected", i.Connecting = "connecting", i.Connected = "connected", i.Reconnecting = "reconnecting", i.SignalReconnecting = "signalReconnecting";
})(V || (V = {}));
const Xm = 4 * 1e3, Zm = 30 * 1e3, eg = "livekit-dummy-audio-el";
let mi;
function tg() {
  const i = document.createElement("audio");
  i.id = eg, i.autoplay = !0, i.hidden = !0;
  const e = al();
  e.enabled = !0;
  const t = new MediaStream([e]);
  return i.srcObject = t, document.body.append(i), {
    element: i,
    stream: t,
    track: e,
    refCount: 0
  };
}
class wn extends xe.EventEmitter {
  get hasE2EESetup() {
    return this.slots.e2eeManager !== void 0;
  }
  /**
   * Creates a new Room, the primary construct for a LiveKit session.
   * @param options
   */
  constructor(e) {
    var t, n, r, s, o;
    if (super(), t = this, this.state = V.Disconnected, this.activeSpeakers = [], this.isE2EEEnabled = !1, this.audioEnabled = !0, this.ownsAudioContext = !1, this.audioContextReleased = !1, this.audioContextMutex = new fe(), this.acquiredEmptyAudioTracks = /* @__PURE__ */ new Set(), this.isVideoPlaybackBlocked = !1, this.log = q, this.statsLog = q, this.bufferedEvents = [], this.isResuming = !1, this.pendingTrackAddedCallbacks = /* @__PURE__ */ new Map(), this.installedExtensions = /* @__PURE__ */ new Map(), this.slots = {}, this.extensionDisposers = [], this.dataPacketHandlers = /* @__PURE__ */ new Map(), this.disposed = !1, this.connect = (a, c, d) => m(this, void 0, void 0, function* () {
      var l;
      if (this.disposed)
        throw new $("room has been disposed");
      if (!zf())
        throw qe() ? Error("WebRTC isn't detected, have you called registerGlobals?") : Error("LiveKit doesn't seem to be supported on this browser. Try to update your browser and make sure no browser extensions are disabling webRTC.");
      const u = yield this.disconnectLock.lock();
      if (this.disposed)
        throw u(), new $("room has been disposed");
      if (this.state === V.Connected)
        return this.log.info("already connected to room ".concat(this.name)), u(), Promise.resolve();
      if (this.connectFuture)
        return u(), this.connectFuture.promise;
      this.setAndEmitConnectionState(V.Connecting), ((l = this.regionUrlProvider) === null || l === void 0 ? void 0 : l.getServerUrl().toString()) !== ll(a) && (this.regionUrl = void 0, this.regionUrlProvider = void 0), Sn(new URL(a)) && (this.regionUrlProvider === void 0 ? this.regionUrlProvider = new W(a, c) : this.regionUrlProvider.updateToken(c), this.regionUrlProvider.fetchRegionSettings().then((g) => {
        var p;
        (p = this.regionUrlProvider) === null || p === void 0 || p.setServerReportedRegions(g);
      }).catch((g) => {
        this.log.warn("could not fetch region settings", {
          error: g
        });
      }));
      const h = (g, p, y) => m(this, void 0, void 0, function* () {
        this.abortController && this.abortController.abort();
        const k = new AbortController();
        this.abortController = k, u?.();
        const w = (A, b) => {
          this.abortController === k && this.handleDisconnect(this.options.stopLocalTrackOnUnpublish, b), p(A);
        };
        try {
          if (yield mn.getInstance().getBackOffPromise(a), k.signal.aborted)
            throw M.cancelled("Connection attempt aborted");
          yield this.attemptConnection(y ?? a, c, d, k), this.abortController = void 0, g();
        } catch (A) {
          if (this.regionUrlProvider && A instanceof M && wf(A)) {
            let b = null;
            try {
              this.log.debug("Fetching next region"), b = yield this.regionUrlProvider.getNextBestRegionUrl(k.signal);
            } catch (T) {
              if (T instanceof M && (T.status === 401 || T.reason === J.Cancelled)) {
                w(T);
                return;
              }
            }
            // making sure we only register failed attempts on things we actually care about
            [J.InternalError, J.ServerUnreachable, J.Timeout].includes(A.reason) && (this.log.debug("Adding failed connection attempt to back off"), mn.getInstance().addFailedConnectionAttempt(a)), b && !k.signal.aborted ? (this.log.info("Initial connection failed with ConnectionError: ".concat(A.message, ". Retrying with another region: ").concat(b)), this.recreateEngine(!0), yield h(g, p, b)) : w(A, vo(A));
          } else {
            let b = Le.UNKNOWN_REASON;
            A instanceof M && (b = vo(A)), w(A, b);
          }
        }
      }), f = this.regionUrl;
      return this.regionUrl = void 0, this.connectFuture = new ye((g, p) => {
        h(g, p, f);
      }, () => {
        this.clearConnectionFutures();
      }), this.connectFuture.promise;
    }), this.connectSignal = (a, c, d, l, u, h) => m(this, void 0, void 0, function* () {
      const f = yield d.join(a, c, {
        autoSubscribe: l.autoSubscribe,
        adaptiveStream: typeof u.adaptiveStream == "object" ? !0 : u.adaptiveStream,
        disableIceLite: l.disableIceLite,
        subscriberAllowPause: l.subscriberAllowPause,
        clientInfoCapabilities: this.getClientInfoCapabilities(),
        maxRetries: l.maxRetries,
        e2eeEnabled: !!this.slots.e2eeManager,
        websocketTimeout: l.websocketTimeout
      }, h.signal, !u.singlePeerConnection), g = f.joinResponse, p = f.serverInfo;
      if (this.serverInfo = p, !p.version)
        throw new Ef("unknown server version");
      return p.version === "0.15.1" && this.options.dynacast && (this.log.debug("disabling dynacast due to server version"), u.dynacast = !1), g;
    }), this.applyJoinResponse = (a) => {
      const c = a.participant;
      if (this.localParticipant.sid = c.sid, this.localParticipant.identity = c.identity, this.localParticipant.setEnabledPublishCodecs(a.enabledPublishCodecs), this.slots.e2eeManager)
        try {
          this.slots.e2eeManager.setSifTrailer(a.sifTrailer);
        } catch (d) {
          this.log.error(d instanceof Error ? d.message : "Could not set SifTrailer", {
            error: d
          });
        }
      this.handleParticipantUpdates([c, ...a.otherParticipants]), a.room && this.handleRoomUpdate(a.room);
    }, this.attemptConnection = (a, c, d, l) => m(this, void 0, void 0, function* () {
      var u, h;
      this.state === V.Reconnecting || this.isResuming || !((u = this.engine) === null || u === void 0) && u.pendingReconnect ? (this.log.info("Reconnection attempt replaced by new connection attempt"), this.recreateEngine(!0)) : this.maybeCreateEngine();
      const f = this.engine;
      !((h = this.regionUrlProvider) === null || h === void 0) && h.isCloud() && f.setRegionStrategy(this.createRegionStrategy()), this.acquireAudioContext(!0).catch((g) => this.log.warn("Could not acquire audio context", Object.assign(Object.assign({}, this.logContext), {
        error: g
      }))), this.connOptions = Object.assign(Object.assign({}, ma), d), this.connOptions.rtcConfig && (f.rtcConfig = this.connOptions.rtcConfig), this.connOptions.peerConnectionTimeout && (f.peerConnectionTimeout = this.connOptions.peerConnectionTimeout);
      try {
        const g = yield this.connectSignal(a, c, f, this.connOptions, this.options, l);
        this.applyJoinResponse(g), this.setupLocalParticipantEvents(), this.emit(_.SignalConnected);
      } catch (g) {
        yield f.close(), this.recreateEngine(!1, f);
        const p = l.signal.aborted ? M.cancelled("Signal connection aborted") : M.serverUnreachable("could not establish signal connection");
        throw g instanceof Error && (p.message = "".concat(p.message, ": ").concat(g.message)), g instanceof M && (p.reason = g.reason, p.status = g.status), this.log.debug("error trying to establish signal connection", {
          error: g
        }), p;
      }
      if (l.signal.aborted)
        throw yield f.close(), this.recreateEngine(!1, f), M.cancelled("Connection attempt aborted");
      try {
        yield f.waitForPCInitialConnection(this.connOptions.peerConnectionTimeout, l);
      } catch (g) {
        throw yield f.close(), this.recreateEngine(!1, f), g;
      }
      _e() && this.options.disconnectOnPageLeave && (window.addEventListener("pagehide", this.onPageLeave), window.addEventListener("beforeunload", this.onPageLeave)), _e() && window.addEventListener("freeze", this.onPageLeave), this.setAndEmitConnectionState(V.Connected), this.emit(_.Connected), mn.getInstance().resetFailedConnectionAttempts(a), this.registerConnectionReconcile(), this.regionUrlProvider && this.regionUrlProvider.notifyConnected();
    }), this.disconnect = function() {
      for (var a = arguments.length, c = new Array(a), d = 0; d < a; d++)
        c[d] = arguments[d];
      return m(t, [...c], void 0, function() {
        var l = this;
        let u = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0;
        return (function* () {
          var h, f, g;
          const p = yield l.disconnectLock.lock();
          try {
            if (l.state === V.Disconnected) {
              l.log.debug("already disconnected");
              return;
            }
            if (l.log.info("disconnect from room"), l.state === V.Connecting || l.state === V.Reconnecting || l.isResuming) {
              const y = "Abort connection attempt due to user initiated disconnect";
              l.log.warn(y), (h = l.abortController) === null || h === void 0 || h.abort(y), (g = (f = l.connectFuture) === null || f === void 0 ? void 0 : f.reject) === null || g === void 0 || g.call(f, M.cancelled("Client initiated disconnect")), l.connectFuture = void 0;
            }
            l.engine && (l.engine.client.isDisconnected || (yield l.engine.client.sendLeave()), yield l.engine.close()), l.handleDisconnect(u, Le.CLIENT_INITIATED), l.engine = void 0;
          } finally {
            p();
          }
        })();
      });
    }, this.onPageLeave = () => m(this, void 0, void 0, function* () {
      this.log.info("Page leave detected, disconnecting"), yield this.disconnect();
    }), this.startAudio = () => m(this, void 0, void 0, function* () {
      const a = [], c = ke();
      c && c.os === "iOS" && !this.audioContextReleased && a.push(this.acquireDummyAudioElement()), this.remoteParticipants.forEach((d) => {
        d.audioTrackPublications.forEach((l) => {
          l.track && l.track.attachedElements.forEach((u) => {
            a.push(u);
          });
        });
      });
      try {
        yield Promise.all([
          // once the audio context has been released as part of a disconnect there is nothing left
          // to unlock, and creating a new context here would leak it as no disconnect will follow
          ...this.audioContextReleased ? [] : [this.acquireAudioContext()],
          ...a.map((d) => (this.options.webAudioMix || (d.muted = !1), d.play()))
        ]), this.handleAudioPlaybackStarted();
      } catch (d) {
        throw this.handleAudioPlaybackFailed(d), d;
      }
    }), this.startVideo = () => m(this, void 0, void 0, function* () {
      const a = [];
      for (const c of this.remoteParticipants.values())
        c.videoTrackPublications.forEach((d) => {
          var l;
          (l = d.track) === null || l === void 0 || l.attachedElements.forEach((u) => {
            a.includes(u) || a.push(u);
          });
        });
      yield Promise.all(a.map((c) => c.play())).then(() => {
        this.handleVideoPlaybackStarted();
      }).catch((c) => {
        c.name === "NotAllowedError" ? this.handleVideoPlaybackFailed() : this.log.warn("Resuming video playback failed, make sure you call `startVideo` directly in a user gesture handler");
      });
    }), this.handleRestarting = () => {
      var a;
      this.clearConnectionReconcile(), this.isResuming = !1, (a = this.roomInfoBeforeRestart) !== null && a !== void 0 || (this.roomInfoBeforeRestart = this.roomInfo), this.roomInfo = this.roomInfoBeforeRestart, this.bufferedEvents = [];
      for (const c of this.remoteParticipants.values())
        this.handleParticipantDisconnected(c.identity, c);
      !this.connectFuture && this.setAndEmitConnectionState(V.Reconnecting) && this.emit(_.Reconnecting);
    }, this.handleSignalRestarted = (a, c) => m(this, void 0, void 0, function* () {
      this.log.debug("signal reconnected to server, region ".concat(a.serverRegion), {
        region: a.serverRegion
      }), this.bufferedEvents = [];
      const d = this.connectFuture !== void 0, l = this.engine.waitForRestarted(c);
      this.applyJoinResponse(a);
      try {
        yield this.localParticipant.republishAllTracks(void 0, !0);
      } catch (u) {
        this.log.error("error trying to re-publish tracks after reconnection", {
          error: u
        });
      }
      if (!(!(yield l) || c.aborted)) {
        if (this.log.debug("fully reconnected to server", {
          region: a.serverRegion
        }), this.roomInfoBeforeRestart = void 0, d) {
          this.bufferedEvents = [];
          return;
        }
        this.setAndEmitConnectionState(V.Connected), this.emit(_.Reconnected), this.registerConnectionReconcile(), this.emitBufferedEvents();
      }
    }), this.handleParticipantUpdates = (a) => {
      var c;
      const d = [];
      for (const l of a) {
        if (l.identity === this.localParticipant.identity) {
          this.localParticipant.updateInfo(l), d.push(l);
          continue;
        }
        l.identity === "" && (l.identity = (c = this.sidToIdentity.get(l.sid)) !== null && c !== void 0 ? c : "");
        let u = this.remoteParticipants.get(l.identity);
        if (u?.isOlderSession(l)) {
          this.log.debug("ignoring update from an older participant session", {
            remoteIdentity: l.identity,
            staleSid: l.sid,
            currentSid: u.sid
          });
          continue;
        }
        l.state === on.DISCONNECTED ? this.handleParticipantDisconnected(l.identity, u, l.disconnectReason === Le.UNKNOWN_REASON ? void 0 : l.disconnectReason) : this.getOrCreateParticipant(l.identity, l), d.push(l);
      }
      this.extensionResults.forEach((l) => {
        var u;
        return (u = l.onParticipantUpdates) === null || u === void 0 ? void 0 : u.call(l, d);
      });
    }, this.handleActiveSpeakersUpdate = (a) => {
      const c = [], d = {};
      a.forEach((l) => {
        if (d[l.sid] = !0, l.sid === this.localParticipant.sid)
          this.localParticipant.audioLevel = l.level, this.localParticipant.setIsSpeaking(!0), c.push(this.localParticipant);
        else {
          const u = this.getRemoteParticipantBySid(l.sid);
          u && (u.audioLevel = l.level, u.setIsSpeaking(!0), c.push(u));
        }
      }), d[this.localParticipant.sid] || (this.localParticipant.audioLevel = 0, this.localParticipant.setIsSpeaking(!1)), this.remoteParticipants.forEach((l) => {
        d[l.sid] || (l.audioLevel = 0, l.setIsSpeaking(!1));
      }), this.activeSpeakers = c, this.emitWhenConnected(_.ActiveSpeakersChanged, c);
    }, this.handleSpeakersChanged = (a) => {
      const c = /* @__PURE__ */ new Map();
      this.activeSpeakers.forEach((l) => {
        const u = this.remoteParticipants.get(l.identity);
        u && u.sid !== l.sid || c.set(l.sid, l);
      }), a.forEach((l) => {
        let u = this.getRemoteParticipantBySid(l.sid);
        l.sid === this.localParticipant.sid && (u = this.localParticipant), u && (u.audioLevel = l.level, u.setIsSpeaking(l.active), l.active ? c.set(l.sid, u) : c.delete(l.sid));
      });
      const d = Array.from(c.values());
      d.sort((l, u) => u.audioLevel - l.audioLevel), this.activeSpeakers = d, this.emitWhenConnected(_.ActiveSpeakersChanged, d);
    }, this.handleStreamStateUpdate = (a) => {
      a.streamStates.forEach((c) => {
        const d = this.getRemoteParticipantBySid(c.participantSid);
        if (!d)
          return;
        const l = d.getTrackPublicationBySid(c.trackSid);
        if (!l || !l.track)
          return;
        const u = C.streamStateFromProto(c.state), h = l.track.streamState;
        l.track.setStreamState(u), u !== h && (d.emit(x.TrackStreamStateChanged, l, l.track.streamState), this.emitWhenConnected(_.TrackStreamStateChanged, l, l.track.streamState, d));
      });
    }, this.handleSubscriptionPermissionUpdate = (a) => {
      const c = this.getRemoteParticipantBySid(a.participantSid);
      if (!c)
        return;
      const d = c.getTrackPublicationBySid(a.trackSid);
      d && d.setAllowed(a.allowed);
    }, this.handleSubscriptionError = (a) => {
      this.cancelPendingTrackAdded(a.trackSid);
      const c = Array.from(this.remoteParticipants.values()).find((l) => l.trackPublications.has(a.trackSid));
      if (!c)
        return;
      const d = c.getTrackPublicationBySid(a.trackSid);
      d && d.setSubscriptionError(a.err);
    }, this.handleDataPacket = (a, c) => {
      var d;
      const l = this.remoteParticipants.get(a.participantIdentity);
      a.value.case === "user" ? this.handleUserPacket(l, a.value.value, a.kind, c, a.participantIdentity) : a.value.case === "transcription" ? this.handleTranscription(l, a.value.value) : a.value.case === "sipDtmf" ? this.handleSipDtmf(l, a.value.value) : a.value.case === "metrics" ? this.handleMetrics(a.value.value, l) : a.value.case && ((d = this.dataPacketHandlers.get(a.value.case)) === null || d === void 0 || d(a, c, l));
    }, this.handleUserPacket = (a, c, d, l, u) => {
      this.emit(_.DataReceived, c.payload, a, d, c.topic, l, u), a?.emit(x.DataReceived, c.payload, d, l);
    }, this.handleSipDtmf = (a, c) => {
      this.emit(_.SipDTMFReceived, c, a), a?.emit(x.SipDTMFReceived, c);
    }, this.handleTranscription = (a, c) => {
      const d = c.transcribedParticipantIdentity === this.localParticipant.identity ? this.localParticipant : this.getParticipantByIdentity(c.transcribedParticipantIdentity), l = d?.trackPublications.get(c.trackId), u = rp(c, this.transcriptionReceivedTimes);
      l?.emit(R.TranscriptionReceived, u), d?.emit(x.TranscriptionReceived, u, l), this.emit(_.TranscriptionReceived, u, d, l);
    }, this.handleMetrics = (a, c) => {
      this.emit(_.MetricsReceived, a, c);
    }, this.bufferedSegments = /* @__PURE__ */ new Map(), this.handleAudioPlaybackStarted = () => {
      this.canPlaybackAudio || (this.audioEnabled = !0, this.emit(_.AudioPlaybackStatusChanged, !0));
    }, this.handleAudioPlaybackFailed = (a) => {
      this.log.warn("could not playback audio", {
        error: a
      }), this.canPlaybackAudio && (this.audioEnabled = !1, this.emit(_.AudioPlaybackStatusChanged, !1));
    }, this.handleVideoPlaybackStarted = () => {
      this.isVideoPlaybackBlocked && (this.isVideoPlaybackBlocked = !1, this.emit(_.VideoPlaybackStatusChanged, !0));
    }, this.handleVideoPlaybackFailed = () => {
      this.isVideoPlaybackBlocked || (this.isVideoPlaybackBlocked = !0, this.emit(_.VideoPlaybackStatusChanged, !1));
    }, this.handleDeviceChange = () => m(this, void 0, void 0, function* () {
      var a;
      ((a = ke()) === null || a === void 0 ? void 0 : a.os) !== "iOS" && (yield this.selectDefaultDevices()), this.emit(_.MediaDevicesChanged);
    }), this.handleRoomUpdate = (a) => {
      const c = this.roomInfo;
      this.roomInfo = a, c && c.metadata !== a.metadata && this.emitWhenConnected(_.RoomMetadataChanged, a.metadata), c?.activeRecording !== a.activeRecording && this.emitWhenConnected(_.RecordingStatusChanged, a.activeRecording);
    }, this.handleConnectionQualityUpdate = (a) => {
      a.updates.forEach((c) => {
        if (c.participantSid === this.localParticipant.sid) {
          this.localParticipant.setConnectionQuality(c.quality);
          return;
        }
        const d = this.getRemoteParticipantBySid(c.participantSid);
        d && d.setConnectionQuality(c.quality);
      });
    }, this.logWebRTCStats = () => m(this, void 0, void 0, function* () {
      var a, c, d, l;
      const u = (a = this.engine) === null || a === void 0 ? void 0 : a.pcManager;
      if (u)
        try {
          const h = yield Promise.all([u.publisher.getStats(), (c = u.subscriber) === null || c === void 0 ? void 0 : c.getStats()]), f = L(h, 2), g = f[0], p = f[1], y = g && hs(g), k = p && hs(p);
          this.statsLog.info("webrtc stats", {
            publisher: y?.connection,
            subscriber: k?.connection,
            inbound: [...(d = y?.inbound) !== null && d !== void 0 ? d : [], ...(l = k?.inbound) !== null && l !== void 0 ? l : []],
            outbound: y?.outbound
          });
        } catch (h) {
          this.statsLog.debug("could not collect webrtc stats", {
            error: h
          });
        }
    }), this.onLocalParticipantMetadataChanged = (a) => {
      this.emit(_.ParticipantMetadataChanged, a, this.localParticipant);
    }, this.onLocalParticipantNameChanged = (a) => {
      this.emit(_.ParticipantNameChanged, a, this.localParticipant);
    }, this.onLocalAttributesChanged = (a) => {
      this.emit(_.ParticipantAttributesChanged, a, this.localParticipant);
    }, this.onLocalTrackMuted = (a) => {
      this.emit(_.TrackMuted, a, this.localParticipant);
    }, this.onLocalTrackUnmuted = (a) => {
      this.emit(_.TrackUnmuted, a, this.localParticipant);
    }, this.onTrackProcessorUpdate = (a) => {
      var c;
      (c = a?.onPublish) === null || c === void 0 || c.call(a, this);
    }, this.onLocalTrackPublished = (a) => m(this, void 0, void 0, function* () {
      var c, d, l, u, h, f;
      (c = a.track) === null || c === void 0 || c.on(R.TrackProcessorUpdate, this.onTrackProcessorUpdate), (d = a.track) === null || d === void 0 || d.on(R.Restarted, this.onLocalTrackRestarted), (h = (u = (l = a.track) === null || l === void 0 ? void 0 : l.getProcessor()) === null || u === void 0 ? void 0 : u.onPublish) === null || h === void 0 || h.call(u, this), this.emit(_.LocalTrackPublished, a, this.localParticipant), et(a.track) && (yield a.track.checkForSilence()) && this.emit(_.LocalAudioSilenceDetected, a);
      const g = yield (f = a.track) === null || f === void 0 ? void 0 : f.getDeviceId(!1), p = ps(a.source);
      p && g && g !== this.localParticipant.activeDeviceMap.get(p) && (this.localParticipant.activeDeviceMap.set(p, g), this.emit(_.ActiveDeviceChanged, p, g));
    }), this.onLocalTrackUnpublished = (a) => {
      var c, d;
      (c = a.track) === null || c === void 0 || c.off(R.TrackProcessorUpdate, this.onTrackProcessorUpdate), (d = a.track) === null || d === void 0 || d.off(R.Restarted, this.onLocalTrackRestarted), this.emit(_.LocalTrackUnpublished, a, this.localParticipant);
    }, this.onLocalTrackRestarted = (a) => m(this, void 0, void 0, function* () {
      const c = yield a.getDeviceId(!1), d = ps(a.source);
      d && c && c !== this.localParticipant.activeDeviceMap.get(d) && (this.log.debug("local track restarted, setting ".concat(d, " ").concat(c, " active")), this.localParticipant.activeDeviceMap.set(d, c), this.emit(_.ActiveDeviceChanged, d, c));
    }), this.onLocalConnectionQualityChanged = (a) => {
      this.emit(_.ConnectionQualityChanged, a, this.localParticipant);
    }, this.onMediaDevicesError = (a, c) => {
      this.emit(_.MediaDevicesError, a, c);
    }, this.onLocalParticipantPermissionsChanged = (a) => {
      this.emit(_.ParticipantPermissionsChanged, a, this.localParticipant);
    }, this.setMaxListeners(100), this.remoteParticipants = /* @__PURE__ */ new Map(), this.sidToIdentity = /* @__PURE__ */ new Map(), this.options = Object.assign(Object.assign({}, ym), e), this.log = pe((n = this.options.loggerName) !== null && n !== void 0 ? n : ne.Room, () => this.logContext), this.statsLog = pe(ne.Stats, () => this.logContext), this.transcriptionReceivedTimes = /* @__PURE__ */ new Map(), this.options.audioCaptureDefaults = Object.assign(Object.assign({}, gl), e?.audioCaptureDefaults), this.options.videoCaptureDefaults = Object.assign({}, e?.videoCaptureDefaults), this.options.publishDefaults = Object.assign(Object.assign({}, bm), e?.publishDefaults), this.maybeCreateEngine(), this.disconnectLock = new fe(), this.localParticipant = new qo("", "", this.engine, this.options, this.slots), this.options.videoCaptureDefaults.deviceId && this.localParticipant.activeDeviceMap.set("videoinput", hn(this.options.videoCaptureDefaults.deviceId)), this.options.audioCaptureDefaults.deviceId && this.localParticipant.activeDeviceMap.set("audioinput", hn(this.options.audioCaptureDefaults.deviceId)), !((r = this.options.audioOutput) === null || r === void 0) && r.deviceId && this.switchActiveDevice("audiooutput", hn(this.options.audioOutput.deviceId)).catch((a) => this.log.warn("Could not set audio output: ".concat(a.message))), _e()) {
      const a = new AbortController();
      this.cleanupController = a;
      let c;
      const d = this.constructor.cleanupRegistry;
      d ? (c = wn.createWeakDeviceChangeListener(new WeakRef(this)), d.register(this, a)) : c = this.handleDeviceChange, (o = (s = navigator.mediaDevices) === null || s === void 0 ? void 0 : s.addEventListener) === null || o === void 0 || o.call(s, "devicechange", c, {
        signal: a.signal
      });
    }
  }
  /**
   * Installs resolved extensions on this room. `installExtensions()` in `extensions.ts` resolves
   * dependencies and calls this; `createRoom()` and the full `Room` go through it.
   * @internal
   */
  installExtensions(e) {
    var t;
    const n = {
      log: this.log,
      get: (o) => {
        const a = this.installedExtensions.get(o.key);
        if (!a)
          throw new Error("extension '".concat(String(o.key), "' is not installed"));
        return a;
      },
      slot: (o) => this.slots[o],
      getOrCreateParticipant: (o, a) => this.getOrCreateParticipant(o, a),
      simulateConnected: (o, a) => this.simulateConnected(o, a),
      acquireEmptyAudioStreamTrack: () => this.acquireEmptyAudioStreamTrack()
    }, r = [];
    for (const o of e) {
      if (this.installedExtensions.has(o.key))
        throw new Error("extension '".concat(String(o.key), "' is already installed"));
      const a = o.install(this, n);
      this.installedExtensions.set(o.key, a), r.push(a);
      for (const c of Object.entries((t = a.dataPackets) !== null && t !== void 0 ? t : {})) {
        var s = L(c, 2);
        const d = s[0], l = s[1];
        if (this.dataPacketHandlers.has(d))
          throw new Error("data packet case '".concat(d, "' is already handled by another extension"));
        this.dataPacketHandlers.set(d, (u, h, f) => l(u.value.value, u, h, f));
      }
      for (const c of Nm)
        a[c] !== void 0 && (this.slots[c] = a[c]);
      Wo(this, wn.prototype, a.room, o), Wo(this.localParticipant, qo.prototype, a.localParticipant, o), a.dispose && this.extensionDisposers.push(a.dispose);
    }
    this.applySlotsToEngine(), r.forEach((o) => {
      var a;
      return (a = o.onEngineCreated) === null || a === void 0 ? void 0 : a.call(o, this.engine);
    });
  }
  /** The engine keeps its own copy of the slots it reads on the hot path. */
  applySlotsToEngine() {
    this.engine.e2eeManager = this.slots.e2eeManager, this.engine.frameMetadataOptions = this.slots.frameMetadataOptions;
  }
  get extensionResults() {
    return Array.from(this.installedExtensions.values());
  }
  /**
   * Releases everything the room holds: disconnects if connected, disposes the extensions and
   * removes global listeners. The room cannot connect again afterwards.
   */
  dispose() {
    return m(this, void 0, void 0, function* () {
      var e;
      if (!this.disposed) {
        this.disposed = !0, this.state !== V.Disconnected && (yield this.disconnect());
        for (const t of this.extensionDisposers.reverse())
          t();
        (e = this.cleanupController) === null || e === void 0 || e.abort();
      }
    });
  }
  get logContext() {
    var e, t, n;
    return {
      room: this.name,
      roomID: (e = this.roomInfo) === null || e === void 0 ? void 0 : e.sid,
      participant: (t = this.localParticipant) === null || t === void 0 ? void 0 : t.identity,
      participantID: (n = this.localParticipant) === null || n === void 0 ? void 0 : n.sid
    };
  }
  /**
   * if the current room has a participant with `recorder: true` in its JWT grant
   **/
  get isRecording() {
    var e, t;
    return (t = (e = this.roomInfo) === null || e === void 0 ? void 0 : e.activeRecording) !== null && t !== void 0 ? t : !1;
  }
  /**
   * server assigned unique room id.
   * returns once a sid has been issued by the server.
   */
  getSid() {
    return this.state === V.Disconnected ? Ee.resolve("") : this.roomInfo && this.roomInfo.sid !== "" ? Ee.resolve(this.roomInfo.sid) : new Ee((e, t) => {
      const n = (r) => {
        r.sid !== "" && (this.engine.off(P.RoomUpdate, n), e(r.sid));
      };
      this.engine.on(P.RoomUpdate, n), this.once(_.Disconnected, () => {
        this.engine.off(P.RoomUpdate, n), t(new $("Room disconnected before room server id was available"));
      });
    });
  }
  /** user assigned name, derived from JWT token */
  get name() {
    var e, t;
    return (t = (e = this.roomInfo) === null || e === void 0 ? void 0 : e.name) !== null && t !== void 0 ? t : "";
  }
  /** room metadata */
  get metadata() {
    var e;
    return (e = this.roomInfo) === null || e === void 0 ? void 0 : e.metadata;
  }
  get numParticipants() {
    var e, t;
    return (t = (e = this.roomInfo) === null || e === void 0 ? void 0 : e.numParticipants) !== null && t !== void 0 ? t : 0;
  }
  get numPublishers() {
    var e, t;
    return (t = (e = this.roomInfo) === null || e === void 0 ? void 0 : e.numPublishers) !== null && t !== void 0 ? t : 0;
  }
  maybeCreateEngine() {
    this.engine && (this.engine.isNewlyCreated || !this.engine.isClosed) || (this.engine = new Om(this.options), this.applySlotsToEngine(), this.engine.on(P.ParticipantUpdate, this.handleParticipantUpdates).on(P.RoomUpdate, this.handleRoomUpdate).on(P.SpeakersChanged, this.handleSpeakersChanged).on(P.StreamStateChanged, this.handleStreamStateUpdate).on(P.ConnectionQualityUpdate, this.handleConnectionQualityUpdate).on(P.SubscriptionError, this.handleSubscriptionError).on(P.SubscriptionPermissionUpdate, this.handleSubscriptionPermissionUpdate).on(P.MediaTrackAdded, (e, t, n) => {
      this.onTrackAdded(e, t, n);
    }).on(P.Disconnected, (e) => {
      var t;
      (t = this.abortController) === null || t === void 0 || t.abort("room disconnected by the server during connection attempt"), this.handleDisconnect(this.options.stopLocalTrackOnUnpublish, e);
    }).on(P.ActiveSpeakersUpdate, this.handleActiveSpeakersUpdate).on(P.DataPacketReceived, this.handleDataPacket).on(P.Resuming, () => {
      this.clearConnectionReconcile(), this.isResuming = !0, this.log.debug("Resuming signal connection"), !this.connectFuture && this.setAndEmitConnectionState(V.SignalReconnecting) && this.emit(_.SignalReconnecting);
    }).on(P.Resumed, () => {
      if (this.registerConnectionReconcile(), this.isResuming = !1, this.log.debug("Resumed signal connection"), this.updateSubscriptions(), this.connectFuture) {
        this.bufferedEvents = [];
        return;
      }
      this.setAndEmitConnectionState(V.Connected) && this.emit(_.Reconnected), this.emitBufferedEvents();
    }).on(P.SignalResumed, () => {
      (this.state === V.Reconnecting || this.isResuming) && this.sendSyncState(), this.emitBufferedEvents();
    }).on(P.Restarting, this.handleRestarting).on(P.SignalRestarted, this.handleSignalRestarted).on(P.Restarted, () => {
      this.state === V.Connected && this.emitBufferedEvents();
    }).on(P.Offline, () => {
      !this.connectFuture && this.setAndEmitConnectionState(V.Reconnecting) && this.emit(_.Reconnecting);
    }).on(P.DCBufferStatusChanged, (e, t) => {
      this.emit(_.DCBufferStatusChanged, e, t);
    }).on(P.LocalTrackSubscribed, (e) => {
      this.handleLocalTrackSubscribed(e);
    }).on(P.RoomMoved, (e) => {
      this.log.debug("room moved", e), e.room && this.handleRoomUpdate(e.room), this.remoteParticipants.forEach((t, n) => {
        this.handleParticipantDisconnected(n, t);
      }), this.emit(_.Moved, e.room.name), e.participant ? this.handleParticipantUpdates([e.participant, ...e.otherParticipants]) : this.handleParticipantUpdates(e.otherParticipants);
    }).on(P.TokenRefreshed, (e) => {
      var t;
      (t = this.regionUrlProvider) === null || t === void 0 || t.updateToken(e);
    }).on(P.ServerRegionsReported, (e) => {
      var t;
      (t = this.regionUrlProvider) === null || t === void 0 || t.setServerReportedRegions({
        regionSettings: e,
        updatedAtInMs: Date.now(),
        maxAgeInMs: Es
      });
    }).on(P.RequestSubscribedCodecRefresh, () => {
      for (const e of this.localParticipant.videoTrackPublications.values())
        Fe(e.track) && e.track.refreshSubscribedCodecs();
    }), this.localParticipant && this.localParticipant.setupEngine(this.engine), this.slots.e2eeManager && this.slots.e2eeManager.setupEngine(this.engine), this.extensionResults.forEach((e) => {
      var t;
      return (t = e.onEngineCreated) === null || t === void 0 ? void 0 : t.call(e, this.engine);
    }));
  }
  createRegionStrategy() {
    return {
      getNextUrl: (e) => m(this, void 0, void 0, function* () {
        return this.regionUrlProvider ? this.regionUrlProvider.getNextBestRegionUrl(e) : null;
      }),
      resetAttempts: () => {
        var e;
        return (e = this.regionUrlProvider) === null || e === void 0 ? void 0 : e.resetAttempts();
      }
    };
  }
  /**
   * getLocalDevices abstracts navigator.mediaDevices.enumerateDevices.
   * In particular, it requests device permissions by default if needed
   * and makes sure the returned device does not consist of dummy devices
   * @param kind
   * @returns a list of available local devices
   */
  static getLocalDevices(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
    return he.getInstance().getDevices(e, t);
  }
  /**
   * Builds the constructor's `devicechange` listener. It lives outside the constructor so that
   * its closure only captures `roomRef`, not the constructor's context (which holds the Room).
   */
  static createWeakDeviceChangeListener(e) {
    return () => {
      var t;
      (t = e.deref()) === null || t === void 0 || t.handleDeviceChange();
    };
  }
  /**
   * prepareConnection should be called as soon as the page is loaded, in order
   * to speed up the connection attempt. This function will
   * - perform DNS resolution and pre-warm the DNS cache
   * - establish TLS connection and cache TLS keys
   *
   * With LiveKit Cloud, it will also determine the best edge data center for
   * the current client to connect to if a token is provided.
   */
  prepareConnection(e, t) {
    return m(this, void 0, void 0, function* () {
      if (this.state === V.Disconnected) {
        this.log.debug("prepareConnection to ".concat(e));
        try {
          if (Sn(new URL(e)) && t) {
            this.regionUrlProvider = new W(e, t);
            const n = yield this.regionUrlProvider.getNextBestRegionUrl();
            n && this.state === V.Disconnected && (this.regionUrl = n, yield fetch(Qn(n), {
              method: "HEAD"
            }), this.log.debug("prepared connection to ".concat(n)));
          } else
            yield fetch(Qn(e), {
              method: "HEAD"
            });
        } catch (n) {
          this.log.warn("could not prepare connection", {
            error: n
          });
        }
      }
    });
  }
  /**
   * retrieves a participant by identity
   * @param identity
   * @returns
   */
  getParticipantByIdentity(e) {
    return this.localParticipant.identity === e ? this.localParticipant : this.remoteParticipants.get(e);
  }
  clearConnectionFutures() {
    this.connectFuture = void 0;
  }
  /**
   * @internal for testing
   */
  simulateScenario(e, t) {
    return m(this, void 0, void 0, function* () {
      let n = () => m(this, void 0, void 0, function* () {
      }), r;
      switch (e) {
        case "signal-reconnect":
          const s = typeof t == "number" ? t : 0;
          yield this.engine.client.handleOnClose("simulate disconnect", void 0, s);
          break;
        case "fail-on-v1-path":
          this.engine.failNextV1Path();
          break;
        case "speaker":
          r = new Xe({
            scenario: {
              case: "speakerUpdate",
              value: 3
            }
          });
          break;
        case "node-failure":
          r = new Xe({
            scenario: {
              case: "nodeFailure",
              value: !0
            }
          });
          break;
        case "server-leave":
          r = new Xe({
            scenario: {
              case: "serverLeave",
              value: !0
            }
          });
          break;
        case "migration":
          r = new Xe({
            scenario: {
              case: "migration",
              value: !0
            }
          });
          break;
        case "resume-reconnect":
          this.engine.failNext(), yield this.engine.client.handleOnClose("simulate resume-disconnect");
          break;
        case "disconnect-signal-on-resume":
          n = () => m(this, void 0, void 0, function* () {
            yield this.engine.client.handleOnClose("simulate resume-disconnect");
          }), r = new Xe({
            scenario: {
              case: "disconnectSignalOnResume",
              value: !0
            }
          });
          break;
        case "disconnect-signal-on-resume-no-messages":
          n = () => m(this, void 0, void 0, function* () {
            yield this.engine.client.handleOnClose("simulate resume-disconnect");
          }), r = new Xe({
            scenario: {
              case: "disconnectSignalOnResumeNoMessages",
              value: !0
            }
          });
          break;
        case "full-reconnect":
          this.engine.fullReconnectOnNext = !0, yield this.engine.client.handleOnClose("simulate full-reconnect");
          break;
        case "force-tcp":
        case "force-tls":
          r = new Xe({
            scenario: {
              case: "switchCandidateProtocol",
              value: e === "force-tls" ? 2 : 1
            }
          }), n = () => m(this, void 0, void 0, function* () {
            const o = this.engine.client.onLeave;
            o && o(new tr({
              reason: Le.CLIENT_INITIATED,
              action: cn.RECONNECT
            }));
          });
          break;
        case "subscriber-bandwidth":
          if (t === void 0 || typeof t != "number")
            throw new Error("subscriber-bandwidth requires a number as argument");
          r = new Xe({
            scenario: {
              case: "subscriberBandwidth",
              value: Qe(t)
            }
          });
          break;
        case "leave-full-reconnect":
          r = new Xe({
            scenario: {
              case: "leaveRequestFullReconnect",
              value: !0
            }
          });
      }
      r && (yield this.engine.client.sendSimulateScenario(r), yield n());
    });
  }
  /**
   * iOS blocks audio element playback if
   * - user is not publishing audio themselves and
   * - no other audio source is playing
   *
   * as a workaround, we create an audio element with an empty track, so that
   * silent audio is always playing
   *
   * The element is shared with any other room on the page and handed back on disconnect, so it
   * outlives whichever room happened to create it.
   */
  acquireDummyAudioElement() {
    mi || (mi = tg());
    const e = mi;
    if (this.releaseDummyAudioElement)
      return e.element;
    e.refCount += 1;
    const t = () => {
      e.element.srcObject = document.hidden ? null : e.stream, document.hidden || (this.log.debug("page visible again, triggering startAudio to resume playback and update playback status"), this.startAudio().catch((n) => this.log.warn("Could not restart audio on page becoming visible", Object.assign(Object.assign({}, this.logContext), {
        error: n
      }))));
    };
    return document.addEventListener("visibilitychange", t), this.releaseDummyAudioElement = () => {
      this.releaseDummyAudioElement = void 0, document.removeEventListener("visibilitychange", t), e.refCount -= 1, !(e.refCount > 0) && (e.element.srcObject = null, e.element.remove(), mi = void 0, go(e.track).catch((n) => this.log.warn("Could not release the dummy audio element track", Object.assign(Object.assign({}, this.logContext), {
        error: n
      }))));
    }, e.element;
  }
  /**
   * Obtains a silent audio track from the shared source and keeps track of it, so that it can be
   * handed back on disconnect and the shared `AudioContext` behind it can be closed again.
   */
  acquireEmptyAudioStreamTrack() {
    const e = al();
    return this.acquiredEmptyAudioTracks.add(e), e;
  }
  releaseAcquiredEmptyAudioTrack(e) {
    this.acquiredEmptyAudioTracks.delete(e) && go(e).catch((t) => this.log.warn("Could not release empty audio stream track", Object.assign(Object.assign({}, this.logContext), {
      error: t
    })));
  }
  releaseAcquiredEmptyAudioTracks() {
    for (const e of this.acquiredEmptyAudioTracks)
      this.releaseAcquiredEmptyAudioTrack(e);
  }
  /**
   * Returns true if audio playback is enabled
   */
  get canPlaybackAudio() {
    return this.audioEnabled;
  }
  /**
   * Returns true if video playback is enabled
   */
  get canPlaybackVideo() {
    return !this.isVideoPlaybackBlocked;
  }
  getActiveDevice(e) {
    return this.localParticipant.activeDeviceMap.get(e);
  }
  /**
   * Switches all active devices used in this room to the given device.
   *
   * Note: setting AudioOutput is not supported on some browsers. See [setSinkId](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/setSinkId#browser_compatibility)
   *
   * @param kind use `videoinput` for camera track,
   *  `audioinput` for microphone track,
   *  `audiooutput` to set speaker for all incoming audio tracks
   * @param deviceId
   */
  switchActiveDevice(e, t) {
    return m(this, arguments, void 0, function(n, r) {
      var s = this;
      let o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      return (function* () {
        var a, c, d, l, u, h, f;
        let g = !0, p = !1;
        const y = o ? {
          exact: r
        } : r;
        if (n === "audioinput") {
          p = s.localParticipant.audioTrackPublications.size === 0;
          const k = (a = s.getActiveDevice(n)) !== null && a !== void 0 ? a : s.options.audioCaptureDefaults.deviceId;
          s.options.audioCaptureDefaults.deviceId = y;
          const w = Array.from(s.localParticipant.audioTrackPublications.values()).filter((b) => b.source === C.Source.Microphone);
          try {
            g = (yield Promise.all(w.map((b) => {
              var T;
              return (T = b.audioTrack) === null || T === void 0 ? void 0 : T.setDeviceId(y);
            }))).every((b) => b === !0);
          } catch (b) {
            throw s.options.audioCaptureDefaults.deviceId = k, b;
          }
          const A = w.some((b) => {
            var T, S;
            return (S = (T = b.track) === null || T === void 0 ? void 0 : T.isMuted) !== null && S !== void 0 ? S : !1;
          });
          g && A && (p = !0);
        } else if (n === "videoinput") {
          p = s.localParticipant.videoTrackPublications.size === 0;
          const k = (c = s.getActiveDevice(n)) !== null && c !== void 0 ? c : s.options.videoCaptureDefaults.deviceId;
          s.options.videoCaptureDefaults.deviceId = y;
          const w = Array.from(s.localParticipant.videoTrackPublications.values()).filter((b) => b.source === C.Source.Camera);
          try {
            g = (yield Promise.all(w.map((b) => {
              var T;
              return (T = b.videoTrack) === null || T === void 0 ? void 0 : T.setDeviceId(y);
            }))).every((b) => b === !0);
          } catch (b) {
            throw s.options.videoCaptureDefaults.deviceId = k, b;
          }
          const A = w.some((b) => {
            var T, S;
            return (S = (T = b.track) === null || T === void 0 ? void 0 : T.isMuted) !== null && S !== void 0 ? S : !1;
          });
          g && A && (p = !0);
        } else if (n === "audiooutput") {
          if (p = !0, !vs() && !s.options.webAudioMix || s.options.webAudioMix && s.audioContext && !("setSinkId" in s.audioContext))
            throw new Error("cannot switch audio output, the current browser does not support it");
          s.options.webAudioMix && (r = (d = yield he.getInstance().normalizeDeviceId("audiooutput", r)) !== null && d !== void 0 ? d : ""), (l = (f = s.options).audioOutput) !== null && l !== void 0 || (f.audioOutput = {});
          const k = (u = s.getActiveDevice(n)) !== null && u !== void 0 ? u : s.options.audioOutput.deviceId;
          s.options.audioOutput.deviceId = r;
          try {
            s.options.webAudioMix && ((h = s.audioContext) === null || h === void 0 || h.setSinkId(r)), yield Promise.all(Array.from(s.remoteParticipants.values()).map((w) => w.setAudioOutput({
              deviceId: r
            })));
          } catch (w) {
            throw s.options.audioOutput.deviceId = k, w;
          }
        }
        return p && (s.localParticipant.activeDeviceMap.set(n, r), s.emit(_.ActiveDeviceChanged, n, r)), g;
      })();
    });
  }
  setupLocalParticipantEvents() {
    this.localParticipant.on(x.ParticipantMetadataChanged, this.onLocalParticipantMetadataChanged).on(x.ParticipantNameChanged, this.onLocalParticipantNameChanged).on(x.AttributesChanged, this.onLocalAttributesChanged).on(x.TrackMuted, this.onLocalTrackMuted).on(x.TrackUnmuted, this.onLocalTrackUnmuted).on(x.LocalTrackPublished, this.onLocalTrackPublished).on(x.LocalTrackUnpublished, this.onLocalTrackUnpublished).on(x.ConnectionQualityChanged, this.onLocalConnectionQualityChanged).on(x.MediaDevicesError, this.onMediaDevicesError).on(x.AudioStreamAcquired, this.startAudio).on(x.ParticipantPermissionsChanged, this.onLocalParticipantPermissionsChanged);
  }
  recreateEngine(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : this.engine;
    e && t && !t.client.isDisconnected ? t.client.sendLeave().finally(() => t.close()) : t?.close(), t === this.engine && (this.engine = void 0, this.isResuming = !1, this.remoteParticipants.clear(), this.sidToIdentity.clear(), this.bufferedEvents = [], this.maybeCreateEngine());
  }
  onTrackAdded(e, t, n) {
    var r, s;
    if ([V.Connecting, V.Reconnecting].includes(this.state)) {
      const f = bo(e, t);
      this.log.debug("deferring on track for later", {
        mediaTrackId: e.id,
        mediaStreamId: t.id,
        tracksInStream: t.getTracks().map((y) => y.id)
      });
      const g = () => {
        if (p(), !t.getTracks().includes(e)) {
          this.log.debug("skipping deferred track, the server no longer sends it", {
            mediaTrackId: e.id,
            mediaStreamId: t.id
          });
          return;
        }
        this.onTrackAdded(e, t, n);
      }, p = () => {
        if (this.off(_.Reconnected, g), this.off(_.Connected, g), this.off(_.Disconnected, p), f) {
          const y = this.pendingTrackAddedCallbacks.get(f);
          y?.delete(p), y?.size === 0 && this.pendingTrackAddedCallbacks.delete(f);
        }
      };
      if (this.once(_.Reconnected, g), this.once(_.Connected, g), this.once(_.Disconnected, p), f) {
        const y = (r = this.pendingTrackAddedCallbacks.get(f)) !== null && r !== void 0 ? r : /* @__PURE__ */ new Set();
        y.add(p), this.pendingTrackAddedCallbacks.set(f, y);
      }
      return;
    }
    if (this.state === V.Disconnected) {
      this.log.warn("skipping incoming track after Room disconnected");
      return;
    }
    if (e.readyState === "ended") {
      this.log.debug("skipping incoming track as it already ended");
      return;
    }
    const o = tl(t.id), a = o[0], c = o[1];
    let d = (s = bo(e, t)) !== null && s !== void 0 ? s : e.id;
    if (a === this.localParticipant.sid) {
      this.log.warn("tried to create RemoteParticipant for local participant");
      return;
    }
    const l = Array.from(this.remoteParticipants.values()).find((f) => f.sid === a);
    if (!l) {
      a.startsWith("PA") && this.log.error("Tried to add a track for a participant, that's not present. Sid: ".concat(a));
      return;
    }
    if (!d.startsWith("TR")) {
      const f = this.engine.getTrackIdForReceiver(n);
      if (!f) {
        this.log.error("Tried to add a track whose 'sid' could not be found for a participant, that's not present. Sid: ".concat(a));
        return;
      }
      d = f;
    }
    d.startsWith("TR") || this.log.warn("Tried to add a track whose 'sid' could not be determined for a participant, that's not present. Sid: ".concat(a, ", streamId: ").concat(c, ", trackId: ").concat(d), {
      remoteParticipantID: a,
      streamId: c,
      trackId: d
    });
    let u;
    this.options.adaptiveStream && (typeof this.options.adaptiveStream == "object" ? u = this.options.adaptiveStream : u = {});
    const h = l.addSubscribedMediaTrack(e, d, t, n, u);
    h?.isEncrypted && !this.slots.e2eeManager && this.emit(_.EncryptionError, new Error("Encrypted ".concat(h.source, " track received from participant ").concat(l.sid, ", but room does not have encryption enabled!")));
  }
  cancelPendingTrackAdded(e) {
    var t;
    (t = this.pendingTrackAddedCallbacks.get(e)) === null || t === void 0 || t.forEach((n) => n());
  }
  handleLocalTrackSubscribed(e) {
    const t = () => this.localParticipant.getTrackPublications().find((c) => c.trackSid === e), n = t();
    if (n) {
      this.emitLocalTrackSubscribed(n);
      return;
    }
    this.log.debug("deferring LocalTrackSubscribed, publication not yet available", {
      subscribedSid: e
    });
    const r = 1e4;
    let s;
    const o = (c) => {
      c.trackSid === e && (a(), this.emitLocalTrackSubscribed(c));
    }, a = () => {
      clearTimeout(s), this.localParticipant.off(x.LocalTrackPublished, o), this.off(_.Disconnected, a);
    };
    this.localParticipant.on(x.LocalTrackPublished, o), this.once(_.Disconnected, a), s = setTimeout(() => {
      a();
      const c = t();
      c ? this.emitLocalTrackSubscribed(c) : this.log.warn("could not find local track publication for LocalTrackSubscribed event after timeout", {
        subscribedSid: e
      });
    }, r);
  }
  emitLocalTrackSubscribed(e) {
    this.localParticipant.emit(x.LocalTrackSubscribed, e), this.emitWhenConnected(_.LocalTrackSubscribed, e, this.localParticipant);
  }
  handleDisconnect() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0, t = arguments.length > 1 ? arguments[1] : void 0;
    var n, r, s;
    if (this.clearConnectionReconcile(), this.isResuming = !1, this.bufferedEvents = [], this.roomInfoBeforeRestart = void 0, this.transcriptionReceivedTimes.clear(), this.extensionResults.forEach((o) => {
      var a;
      return (a = o.onDisconnect) === null || a === void 0 ? void 0 : a.call(o);
    }), this.state !== V.Disconnected) {
      this.regionUrl = void 0, this.regionUrlProvider && this.regionUrlProvider.notifyDisconnected();
      try {
        const o = e ? [] : Array.from(this.localParticipant.audioTrackPublications.values()).map((a) => a.track).filter(et);
        this.remoteParticipants.forEach((a) => {
          a.trackPublications.forEach((c) => {
            a.unpublishTrack(c.trackSid);
          });
        }), this.localParticipant.trackPublications.forEach((a) => {
          var c, d, l;
          a.track && this.localParticipant.unpublishTrack(a.track, e), e ? ((c = a.track) === null || c === void 0 || c.detach(), (d = a.track) === null || d === void 0 || d.stop()) : (l = a.track) === null || l === void 0 || l.stopMonitor();
        }), this.localParticipant.off(x.ParticipantMetadataChanged, this.onLocalParticipantMetadataChanged).off(x.ParticipantNameChanged, this.onLocalParticipantNameChanged).off(x.AttributesChanged, this.onLocalAttributesChanged).off(x.TrackMuted, this.onLocalTrackMuted).off(x.TrackUnmuted, this.onLocalTrackUnmuted).off(x.LocalTrackPublished, this.onLocalTrackPublished).off(x.LocalTrackUnpublished, this.onLocalTrackUnpublished).off(x.ConnectionQualityChanged, this.onLocalConnectionQualityChanged).off(x.MediaDevicesError, this.onMediaDevicesError).off(x.AudioStreamAcquired, this.startAudio).off(x.ParticipantPermissionsChanged, this.onLocalParticipantPermissionsChanged), this.localParticipant.trackPublications.clear(), this.localParticipant.videoTrackPublications.clear(), this.localParticipant.audioTrackPublications.clear(), this.remoteParticipants.clear(), this.sidToIdentity.clear(), this.activeSpeakers = [], (n = this.releaseDummyAudioElement) === null || n === void 0 || n.call(this), this.releaseAcquiredEmptyAudioTracks(), this.releaseAudioContext(o).catch((a) => this.log.warn("Could not release audio context", Object.assign(Object.assign({}, this.logContext), {
          error: a
        }))), _e() && (window.removeEventListener("beforeunload", this.onPageLeave), window.removeEventListener("pagehide", this.onPageLeave), window.removeEventListener("freeze", this.onPageLeave), (s = (r = navigator.mediaDevices) === null || r === void 0 ? void 0 : r.removeEventListener) === null || s === void 0 || s.call(r, "devicechange", this.handleDeviceChange));
      } finally {
        this.setAndEmitConnectionState(V.Disconnected), this.emit(_.Disconnected, t);
      }
    }
  }
  handleParticipantDisconnected(e, t, n) {
    this.remoteParticipants.delete(e), t && (t.trackPublications.forEach((r) => {
      t.unpublishTrack(r.trackSid, !0);
    }), this.emit(_.ParticipantDisconnected, t, n), t.setDisconnected());
  }
  /**
   * attempt to select the default devices if the previously selected devices are no longer available after a device change event
   */
  selectDefaultDevices() {
    return m(this, void 0, void 0, function* () {
      var e, t, n;
      const r = he.getInstance().previousDevices, s = yield he.getInstance().getDevices(void 0, !1), o = ke();
      if (o?.name === "Chrome" && o.os !== "iOS")
        for (let c of s) {
          const d = r.find((l) => l.deviceId === c.deviceId);
          d && d.label !== "" && d.kind === c.kind && d.label !== c.label && this.getActiveDevice(c.kind) === "default" && this.emit(_.ActiveDeviceChanged, c.kind, c.deviceId);
        }
      const a = ["audiooutput", "audioinput", "videoinput"];
      for (let c of a) {
        const d = Af(c), l = this.localParticipant.getTrackPublication(d);
        if (l && (!((e = l.track) === null || e === void 0) && e.isUserProvided))
          continue;
        const u = s.filter((f) => f.kind === c), h = this.getActiveDevice(c);
        if (h === ((t = r.filter((f) => f.kind === c)[0]) === null || t === void 0 ? void 0 : t.deviceId) && u.length > 0 && ((n = u[0]) === null || n === void 0 ? void 0 : n.deviceId) !== h) {
          yield this.switchActiveDevice(c, u[0].deviceId);
          continue;
        }
        c === "audioinput" && !$n() || c === "videoinput" || u.length > 0 && !u.find((f) => f.deviceId === this.getActiveDevice(c)) && // avoid switching audio output on safari without explicit user action as it leads to slowed down audio playback
        (c !== "audiooutput" || !$n()) && (yield this.switchActiveDevice(c, u[0].deviceId));
      }
    });
  }
  /**
   * @param forConnect whether this acquisition belongs to a connect, which is the only caller
   * allowed to put a released room back on an audio context.
   */
  acquireAudioContext() {
    return m(this, arguments, void 0, function() {
      var e = this;
      let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !1;
      return (function* () {
        var n, r;
        const s = yield e.audioContextMutex.lock();
        try {
          if (e.audioContextReleased && !t)
            return;
          e.audioContextReleased = !1;
          const o = typeof e.options.webAudioMix != "boolean" ? e.options.webAudioMix.audioContext : void 0;
          if (o ? yield e.setRoomAudioContext(o, !1) : (!e.audioContext || e.audioContext.state === "closed") && (yield e.setRoomAudioContext((n = Zd()) !== null && n !== void 0 ? n : void 0, !0)), e.audioContext && e.audioContext.state === "suspended")
            try {
              yield Promise.race([e.audioContext.resume(), be(200)]);
            } catch (c) {
              e.log.warn("Could not resume audio context", {
                error: c
              });
            }
          const a = ((r = e.audioContext) === null || r === void 0 ? void 0 : r.state) === "running";
          a !== e.canPlaybackAudio && (e.audioEnabled = a, e.emit(_.AudioPlaybackStatusChanged, a));
        } finally {
          s();
        }
      })();
    });
  }
  /**
   * Points the room and its participants at `audioContext`, rebuilding the web audio graph of
   * every audio track in it. Closes the previous context if the SDK `owned` it.
   */
  setRoomAudioContext(e, t) {
    return m(this, void 0, void 0, function* () {
      const n = !!e && t;
      if (this.audioContext === e) {
        this.ownsAudioContext = n;
        return;
      }
      const r = this.ownsAudioContext ? this.audioContext : void 0;
      this.audioContext = e, this.ownsAudioContext = n;
      try {
        this.options.webAudioMix && (yield Promise.all(Array.from(this.remoteParticipants.values()).map((s) => s.setAudioContext(e)))), yield this.localParticipant.setAudioContext(e);
      } catch (s) {
        this.log.warn("Could not move audio tracks to the new audio context", Object.assign(Object.assign({}, this.logContext), {
          error: s
        }));
      } finally {
        if (r && r.state !== "closed")
          try {
            yield r.close();
          } catch (s) {
            this.log.warn("Could not close audio context", Object.assign(Object.assign({}, this.logContext), {
              error: s
            }));
          }
      }
    });
  }
  /**
   * Detaches the web audio graph the SDK built from the current audio context and closes that
   * context if the SDK created it. A context provided through `webAudioMix` is left untouched.
   */
  releaseAudioContext() {
    return m(this, arguments, void 0, function() {
      var e = this;
      let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
      return (function* () {
        e.audioContextReleased = !0;
        const n = e.audioContext, r = yield e.audioContextMutex.lock();
        try {
          if (!e.audioContextReleased || e.audioContext !== n || !e.ownsAudioContext)
            return;
          try {
            yield Promise.all(t.map((s) => s.setAudioContext(void 0)));
          } catch (s) {
            e.log.warn("Could not detach retained audio tracks from the audio context", Object.assign(Object.assign({}, e.logContext), {
              error: s
            }));
          }
          yield e.setRoomAudioContext(void 0, !1);
        } finally {
          r();
        }
      })();
    });
  }
  createParticipant(e, t) {
    var n;
    let r;
    return t ? (r = Bi.fromParticipantInfo(this.engine.client, t, {
      loggerContextCb: () => this.logContext,
      loggerName: this.options.loggerName
    }), this.extensionResults.forEach((s) => {
      var o;
      return (o = s.onParticipantCreated) === null || o === void 0 ? void 0 : o.call(s, r, t);
    })) : r = new Bi(this.engine.client, "", e, void 0, void 0, void 0, {
      loggerContextCb: () => this.logContext,
      loggerName: this.options.loggerName
    }), this.options.webAudioMix && r.setAudioContext(this.audioContext).catch((s) => this.log.warn("Could not set audio context", Object.assign(Object.assign({}, this.logContext), {
      error: s
    }))), !((n = this.options.audioOutput) === null || n === void 0) && n.deviceId && r.setAudioOutput(this.options.audioOutput).catch((s) => this.log.warn("Could not set audio output: ".concat(s.message))), r;
  }
  getOrCreateParticipant(e, t) {
    if (this.remoteParticipants.has(e)) {
      const r = this.remoteParticipants.get(e);
      return t && r.updateInfo(t) && this.sidToIdentity.set(t.sid, t.identity), r;
    }
    const n = this.createParticipant(e, t);
    return this.remoteParticipants.set(e, n), this.sidToIdentity.set(t.sid, t.identity), this.emitWhenConnected(_.ParticipantConnected, n), n.on(x.TrackPublished, (r) => {
      this.emitWhenConnected(_.TrackPublished, r, n);
    }).on(x.TrackSubscribed, (r, s) => {
      r.kind === C.Kind.Audio ? (r.on(R.AudioPlaybackStarted, this.handleAudioPlaybackStarted), r.on(R.AudioPlaybackFailed, this.handleAudioPlaybackFailed)) : r.kind === C.Kind.Video && (r.on(R.VideoPlaybackFailed, this.handleVideoPlaybackFailed), r.on(R.VideoPlaybackStarted, this.handleVideoPlaybackStarted)), this.emitWhenConnected(_.TrackSubscribed, r, s, n);
    }).on(x.TrackUnpublished, (r) => {
      this.cancelPendingTrackAdded(r.trackSid), this.emit(_.TrackUnpublished, r, n);
    }).on(x.TrackUnsubscribed, (r, s) => {
      this.emit(_.TrackUnsubscribed, r, s, n);
    }).on(x.TrackMuted, (r) => {
      this.emitWhenConnected(_.TrackMuted, r, n);
    }).on(x.TrackUnmuted, (r) => {
      this.emitWhenConnected(_.TrackUnmuted, r, n);
    }).on(x.ParticipantMetadataChanged, (r) => {
      this.emitWhenConnected(_.ParticipantMetadataChanged, r, n);
    }).on(x.ParticipantNameChanged, (r) => {
      this.emitWhenConnected(_.ParticipantNameChanged, r, n);
    }).on(x.AttributesChanged, (r) => {
      this.emitWhenConnected(_.ParticipantAttributesChanged, r, n);
    }).on(x.ConnectionQualityChanged, (r) => {
      this.emitWhenConnected(_.ConnectionQualityChanged, r, n);
    }).on(x.ParticipantPermissionsChanged, (r) => {
      this.emitWhenConnected(_.ParticipantPermissionsChanged, r, n);
    }).on(x.TrackSubscriptionStatusChanged, (r, s) => {
      this.emitWhenConnected(_.TrackSubscriptionStatusChanged, r, s, n);
    }).on(x.TrackSubscriptionFailed, (r, s) => {
      this.emit(_.TrackSubscriptionFailed, r, n, s);
    }).on(x.TrackSubscriptionPermissionChanged, (r, s) => {
      this.emitWhenConnected(_.TrackSubscriptionPermissionChanged, r, s, n);
    }).on(x.Active, () => {
      this.emitWhenConnected(_.ParticipantActive, n), n.kind === Gn.AGENT && this.localParticipant.setActiveAgent(n);
    }), t && n.updateInfo(t), n;
  }
  sendSyncState() {
    const e = Array.from(this.remoteParticipants.values()).reduce((r, s) => (r.push(...s.getTrackPublications()), r), []), t = this.localParticipant.getTrackPublications(), n = [].concat(...this.extensionResults.map((r) => {
      var s, o;
      return (o = (s = r.syncState) === null || s === void 0 ? void 0 : s.call(r)) !== null && o !== void 0 ? o : [];
    }));
    this.engine.sendSyncState(e, t, n);
  }
  /**
   * After resuming, we'll need to notify the server of the current
   * subscription settings.
   */
  updateSubscriptions() {
    for (const e of this.remoteParticipants.values())
      for (const t of e.videoTrackPublications.values())
        t.isSubscribed && ap(t) && t.emitTrackUpdate();
  }
  getRemoteParticipantBySid(e) {
    const t = this.sidToIdentity.get(e);
    if (t) {
      const n = this.remoteParticipants.get(t);
      if (n?.sid === e)
        return n;
    }
  }
  /** The client capabilities this SDK advertises to other participants in its `ClientInfo`. */
  getClientInfoCapabilities() {
    const e = [];
    return (Xn(this.slots.frameMetadataOptions) || this.slots.e2eeManager) && e.push(Jn.CAP_PACKET_TRAILER), pn() && e.push(Jn.CAP_COMPRESSION_DEFLATE_RAW), e;
  }
  setStatsLogging(e) {
    e ? this.statsLogInterval || (this.statsLogInterval = z.setInterval(() => {
      this.logWebRTCStats();
    }, Zm)) : this.statsLogInterval && (z.clearInterval(this.statsLogInterval), this.statsLogInterval = void 0);
  }
  registerConnectionReconcile() {
    this.clearConnectionReconcile();
    let e = 0;
    this.connectionReconcileInterval = z.setInterval(() => {
      // ensure we didn't tear it down
      !this.engine || // engine detected close, but Room missed it
      this.engine.isClosed || // transports failed without notifying engine
      !this.engine.verifyTransport() ? (e++, this.log.warn("detected connection state mismatch", {
        numFailures: e,
        engine: this.engine ? {
          closed: this.engine.isClosed,
          transportsConnectedOrConnecting: this.engine.verifyTransport()
        } : void 0
      }), e >= 3 && (this.clearConnectionReconcile(), this.engine && !this.engine.isClosed ? (this.log.warn("detected connection state mismatch, attempting full reconnect"), this.engine.reconnect()) : (this.recreateEngine(), this.handleDisconnect(this.options.stopLocalTrackOnUnpublish, Le.STATE_MISMATCH)))) : e = 0;
    }, Xm);
  }
  clearConnectionReconcile() {
    this.connectionReconcileInterval && z.clearInterval(this.connectionReconcileInterval);
  }
  setAndEmitConnectionState(e) {
    return e === this.state ? !1 : (this.log.info("connection state changed: ".concat(this.state, " -> ").concat(e)), this.state = e, this.setStatsLogging(e === V.Connected), this.emit(_.ConnectionStateChanged, this.state), !0);
  }
  emitBufferedEvents() {
    this.bufferedEvents.forEach((e) => {
      let t = L(e, 2), n = t[0], r = t[1];
      this.emit(n, ...r);
    }), this.bufferedEvents = [];
  }
  emitWhenConnected(e) {
    for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++)
      n[r - 1] = arguments[r];
    if (this.state === V.Reconnecting || this.isResuming || !this.engine || this.engine.pendingReconnect)
      this.bufferedEvents.push([e, n]);
    else if (this.state === V.Connected)
      return this.emit(e, ...n);
    return !1;
  }
  /** Puts the room into the connected state without a server (`ExtensionContext.simulateConnected`). */
  simulateConnected(e, t) {
    this.handleDisconnect(), this.roomInfo = e, this.localParticipant.updateInfo(t), this.setupLocalParticipantEvents(), this.emit(_.SignalConnected), this.emit(_.Connected), this.setAndEmitConnectionState(V.Connected);
  }
  // /** @internal */
  emit(e) {
    for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++)
      n[r - 1] = arguments[r];
    if (e !== _.ActiveSpeakersChanged && e !== _.TranscriptionReceived) {
      const s = Sl(n).filter((o) => o !== void 0);
      (e === _.TrackSubscribed || e === _.TrackUnsubscribed) && this.log.trace("subscribe trace: ".concat(e), {
        event: e,
        args: s
      }), this.log.debug("room event ".concat(e), {
        event: e,
        args: s
      });
    }
    return super.emit(e, ...n);
  }
}
wn.cleanupRegistry = typeof FinalizationRegistry < "u" && typeof WeakRef < "u" && new FinalizationRegistry((i) => {
  i.abort();
});
function Sl(i) {
  return i.map((e) => {
    if (e)
      return Array.isArray(e) ? Sl(e) : typeof e == "object" ? "logContext" in e ? e.logContext : void 0 : e;
  });
}
function Wo(i, e, t, n) {
  if (!t)
    return;
  const r = Object.getOwnPropertyDescriptors(t);
  for (const s of Object.keys(r)) {
    if (Object.getOwnPropertyDescriptor(i, s) || s in e)
      throw new Error("extension '".concat(String(n.key), "' redefines '").concat(s, "'"));
    s in i && delete r[s];
  }
  Object.defineProperties(i, r);
}
const ka = 65535, Cl = 4294967295;
class $e {
  static u16(e) {
    return new $e(e, ka);
  }
  static u32(e) {
    return new $e(e, Cl);
  }
  constructor(e, t) {
    if (this.value = e, e < 0)
      throw new Error("WrapAroundUnsignedInt: cannot faithfully represent an integer smaller than 0");
    if (t > Number.MAX_SAFE_INTEGER)
      throw new Error("WrapAroundUnsignedInt: cannot faithfully represent an integer bigger than MAX_SAFE_INTEGER.");
    this.maxSize = t, this.clamp();
  }
  /** Manually clamp the given containing value according to the wrap around max size bounds. Use
   * this after out of bounds modification to the contained value by external code. */
  clamp() {
    for (; this.value > this.maxSize; )
      this.value -= this.maxSize + 1;
    for (; this.value < 0; )
      this.value += this.maxSize + 1;
  }
  clone() {
    return new $e(this.value, this.maxSize);
  }
  /** When called, maps the containing value to a new containing value. After mapping, the wrap
   * around external max size bounds are applied. Note that this is a mutative operation. */
  update(e) {
    this.value = e(this.value), this.clamp();
  }
  /** Increments the given `n` to the inner value. Note that this is a mutative operation. */
  increment() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;
    this.update((t) => t + e);
  }
  /** Decrements the given `n` from the inner value. Note that this is a mutative operation. */
  decrement() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;
    this.update((t) => t - e);
  }
  getThenIncrement() {
    const e = this.value;
    return this.increment(), new $e(e, this.maxSize);
  }
  /** Returns true if {@link this} is before the passed other {@link WrapAroundUnsignedInt}. */
  isBefore(e) {
    const t = this.value >>> 0, r = (e.value >>> 0) - t >>> 0;
    return r !== 0 && r < this.maxSize + 1;
  }
}
class vn {
  static fromRtpTicks(e) {
    return new vn(e, 9e4);
  }
  /** Generates a timestamp initialized to a non cryptographically secure random value, so that
   * different streams are more difficult to correlate in packet capture. */
  static rtpRandom() {
    const e = Math.round(Math.random() * Cl);
    return vn.fromRtpTicks(e);
  }
  constructor(e, t) {
    this.timestamp = $e.u32(e), this.rateInHz = t;
  }
  asTicks() {
    return this.timestamp.value;
  }
  clone() {
    return new vn(this.timestamp.value, this.rateInHz);
  }
  wrappingAdd(e) {
    this.timestamp.increment(e);
  }
  /** Returns true if {@link this} is before the passed other {@link DataTrackTimestamp}. */
  isBefore(e) {
    return this.timestamp.isBefore(e.timestamp);
  }
}
class Bt {
  constructor(e, t, n) {
    this.epoch = t, this.base = n, this.previous = n.clone(), this.rateInHz = e;
  }
  static startingNow(e, t) {
    return new Bt(t, /* @__PURE__ */ new Date(), e);
  }
  static startingAtTime(e, t, n) {
    return new Bt(n, e, t);
  }
  static rtpStartingNow(e) {
    return Bt.startingNow(e, 9e4);
  }
  static rtpStartingAtTime(e, t) {
    return Bt.startingAtTime(e, t, 9e4);
  }
  now() {
    return this.at(/* @__PURE__ */ new Date());
  }
  at(e) {
    let t = e.getTime() - this.epoch.getTime(), n = Bt.durationInMsToTicks(t, this.rateInHz), r = this.base.clone();
    return r.wrappingAdd(n), r.isBefore(this.previous) && (r = this.previous), this.previous = r.clone(), r.clone();
  }
  /** Convert a duration since the epoch into clock ticks. */
  static durationInMsToTicks(e, t) {
    let r = (e * 1e6 * t + 5e8) / 1e9;
    return Math.round(r);
  }
}
function Ta(i) {
  if (i instanceof DataView)
    return i;
  if (i instanceof ArrayBuffer)
    return new DataView(i);
  if (i instanceof Uint8Array)
    return new DataView(i.buffer, i.byteOffset, i.byteLength);
  throw new Error("Error coercing ".concat(i, " to DataView - input was not DataView, ArrayBuffer, or Uint8Array."));
}
const re = 1, dt = 2, Ho = 4, ng = 8, zo = 0, Ko = 12, Go = 5, ig = 7, Jo = 3, rg = 3, $o = 2, Qo = 1, Yo = 0, Xo = 3, gi = 2, Zo = 2, sg = 1, ag = 0;
var ut;
(function(i) {
  i[i.TooShort = 0] = "TooShort", i[i.HeaderOverrun = 1] = "HeaderOverrun", i[i.MissingExtWords = 2] = "MissingExtWords", i[i.UnsupportedVersion = 3] = "UnsupportedVersion", i[i.InvalidHandle = 4] = "InvalidHandle", i[i.MalformedExt = 5] = "MalformedExt";
})(ut || (ut = {}));
class Ce extends Ve {
  constructor(e, t, n) {
    super(19, e, n), this.name = "DataTrackDeserializeError", this.reason = t, this.reasonName = ut[t];
  }
  static tooShort() {
    return new Ce("Too short to contain a valid header", ut.TooShort);
  }
  static headerOverrun() {
    return new Ce("Header exceeds total packet length", ut.HeaderOverrun);
  }
  static missingExtWords() {
    return new Ce("Extension word indicator is missing", ut.MissingExtWords);
  }
  static unsupportedVersion(e) {
    return new Ce("Unsupported version ".concat(e), ut.UnsupportedVersion);
  }
  static invalidHandle(e) {
    return new Ce("invalid track handle: ".concat(e.message), ut.InvalidHandle, {
      cause: e
    });
  }
  static malformedExt(e) {
    return new Ce("Extension with tag ".concat(e, " is malformed"), ut.MalformedExt);
  }
}
var qn;
(function(i) {
  i[i.TooSmallForHeader = 0] = "TooSmallForHeader", i[i.TooSmallForPayload = 1] = "TooSmallForPayload";
})(qn || (qn = {}));
class Zn extends Ve {
  constructor(e, t, n) {
    super(19, e, n), this.name = "DataTrackSerializeError", this.reason = t, this.reasonName = qn[t];
  }
  static tooSmallForHeader() {
    return new Zn("Buffer cannot fit header", qn.TooSmallForHeader);
  }
  static tooSmallForPayload() {
    return new Zn("Buffer cannot fit payload", qn.TooSmallForPayload);
  }
}
class ar {
  /** Encodes the instance as binary and returns the data as a Uint8Array. */
  toBinary() {
    const e = this.toBinaryLengthBytes(), t = new ArrayBuffer(e), n = new DataView(t), r = this.toBinaryInto(n);
    if (e !== r)
      throw new Error("".concat(this.constructor.name, ".toBinary: written bytes (").concat(r, " bytes) not equal to allocated array buffer length (").concat(e, " bytes)."));
    return new Uint8Array(t);
  }
}
var En;
(function(i) {
  i[i.UserTimestamp = 2] = "UserTimestamp", i[i.E2ee = 1] = "E2ee";
})(En || (En = {}));
class wl extends ar {
}
class Ge extends wl {
  constructor(e) {
    super(), this.timestamp = e;
  }
  toBinaryLengthBytes() {
    return re + re + Ge.lengthBytes;
  }
  toBinaryInto(e) {
    let t = 0;
    e.setUint8(t, Ge.tag), t += re, e.setUint8(t, Ge.lengthBytes), t += re, e.setBigUint64(t, this.timestamp), t += ng;
    const n = this.toBinaryLengthBytes();
    if (t !== n)
      throw new Error("DataTrackUserTimestampExtension.toBinaryInto: Wrote ".concat(t, " bytes but expected length was ").concat(n, " bytes"));
    return t;
  }
  toJSON() {
    return {
      tag: Ge.tag,
      lengthBytes: Ge.lengthBytes,
      timestamp: this.timestamp
    };
  }
}
Ge.tag = En.UserTimestamp;
Ge.lengthBytes = 8;
class Je extends wl {
  constructor(e, t) {
    super(), this.keyIndex = e, this.iv = t;
  }
  toBinaryLengthBytes() {
    return re + re + Je.lengthBytes;
  }
  toBinaryInto(e) {
    let t = 0;
    e.setUint8(t, Je.tag), t += re, e.setUint8(t, Je.lengthBytes), t += re, e.setUint8(t, this.keyIndex), t += re;
    for (let r = 0; r < this.iv.length; r += 1)
      e.setUint8(t, this.iv[r]), t += re;
    const n = this.toBinaryLengthBytes();
    if (t !== n)
      throw new Error("DataTrackE2eeExtension.toBinaryInto: Wrote ".concat(t, " bytes but expected length was ").concat(n, " bytes"));
    return t;
  }
  toJSON() {
    return {
      tag: Je.tag,
      lengthBytes: Je.lengthBytes,
      keyIndex: this.keyIndex,
      iv: this.iv
    };
  }
}
Je.tag = En.E2ee;
Je.lengthBytes = 13;
class bn extends ar {
  constructor() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    super(), this.userTimestamp = e.userTimestamp, this.e2ee = e.e2ee;
  }
  toBinaryLengthBytes() {
    let e = 0;
    return this.userTimestamp && (e += this.userTimestamp.toBinaryLengthBytes()), this.e2ee && (e += this.e2ee.toBinaryLengthBytes()), e;
  }
  toBinaryInto(e) {
    let t = 0;
    if (this.e2ee) {
      const r = this.e2ee.toBinaryInto(e);
      t += r;
    }
    if (this.userTimestamp) {
      const r = this.userTimestamp.toBinaryInto(new DataView(e.buffer, e.byteOffset + t));
      t += r;
    }
    const n = this.toBinaryLengthBytes();
    if (t !== n)
      throw new Error("DataTrackExtensions.toBinaryInto: Wrote ".concat(t, " bytes but expected length was ").concat(n, " bytes"));
    return t;
  }
  static fromBinary(e) {
    const t = Ta(e);
    let n, r, s = 0;
    for (; t.byteLength - s >= re + re; ) {
      const o = t.getUint8(s);
      s += re;
      const a = t.getUint8(s);
      if (s += re, o !== ag)
        switch (o) {
          case En.UserTimestamp:
            if (t.byteLength - s < Ge.lengthBytes)
              throw Ce.malformedExt(o);
            n = new Ge(t.getBigUint64(s)), s += a;
            break;
          case En.E2ee:
            if (t.byteLength - s < Je.lengthBytes)
              throw Ce.malformedExt(o);
            const c = t.getUint8(s), d = new Uint8Array(12);
            for (let l = 0; l < d.length; l += 1) {
              let u = s;
              u += re, u += l * re, d[l] = t.getUint8(u);
            }
            r = new Je(c, d), s += a;
            break;
          default:
            if (t.byteLength - s < a)
              throw Ce.malformedExt(o);
            s += a;
            break;
        }
    }
    return [new bn({
      userTimestamp: n,
      e2ee: r
    }), t.byteLength];
  }
  toJSON() {
    var e, t, n, r;
    return {
      userTimestamp: (t = (e = this.userTimestamp) === null || e === void 0 ? void 0 : e.toJSON()) !== null && t !== void 0 ? t : null,
      e2ee: (r = (n = this.e2ee) === null || n === void 0 ? void 0 : n.toJSON()) !== null && r !== void 0 ? r : null
    };
  }
}
const El = {
  from(i) {
    return {
      payload: i.payload,
      extensions: new bn({
        userTimestamp: i.userTimestamp ? new Ge(i.userTimestamp) : void 0
      })
    };
  },
  /** Converts from a DataTrackFrameInternal -> DataTrackFrame. Some internal information is
   * discarded like e2ee encrption extension data. */
  lossyIntoFrame(i) {
    var e;
    return {
      payload: i.payload,
      userTimestamp: (e = i.extensions.userTimestamp) === null || e === void 0 ? void 0 : e.timestamp
    };
  }
};
var zt;
(function(i) {
  i[i.Reserved = 0] = "Reserved", i[i.TooLarge = 1] = "TooLarge";
})(zt || (zt = {}));
class _n extends Ve {
  constructor(e, t) {
    super(19, e), this.name = "DataTrackHandleError", this.reason = t, this.reasonName = zt[t];
  }
  isReason(e) {
    return this.reason === e;
  }
  static tooLarge() {
    return new _n("Value too large to be a valid track handle", zt.TooLarge);
  }
  static reserved(e) {
    return new _n("0x".concat(e.toString(16), " is a reserved value."), zt.Reserved);
  }
}
const og = {
  fromNumber(i) {
    if (i === 0)
      throw _n.reserved(i);
    if (i > ka)
      throw _n.tooLarge();
    return i;
  }
};
class cg {
  constructor() {
    this.value = 0;
  }
  /** Returns a unique track handle for the next publication, if one can be obtained. */
  get() {
    return this.value += 1, this.value > ka ? null : this.value;
  }
  reset() {
    this.value = 0;
  }
}
class ei extends ar {
  constructor(e) {
    var t;
    super(), this.marker = e.marker, this.trackHandle = e.trackHandle, this.sequence = e.sequence, this.frameNumber = e.frameNumber, this.timestamp = e.timestamp, this.extensions = (t = e.extensions) !== null && t !== void 0 ? t : new bn();
  }
  extensionsMetrics() {
    const e = this.extensions.toBinaryLengthBytes(), t = Math.ceil((gi + e) / 4), n = t * 4 - gi - e;
    return {
      lengthBytes: e,
      lengthWords: t,
      paddingLengthBytes: n
    };
  }
  toBinaryLengthBytes() {
    const e = this.extensionsMetrics(), t = e.lengthBytes, n = e.paddingLengthBytes;
    let r = Ko;
    return t > 0 && (r += gi + t + n), r;
  }
  toBinaryInto(e) {
    if (e.byteLength < this.toBinaryLengthBytes())
      throw Zn.tooSmallForHeader();
    let t = zo << Go, n;
    switch (this.marker) {
      case Z.Inter:
        n = Yo;
        break;
      case Z.Final:
        n = Qo;
        break;
      case Z.Start:
        n = $o;
        break;
      case Z.Single:
        n = Xo;
        break;
    }
    t |= n << Jo;
    const r = this.extensionsMetrics(), s = r.lengthBytes, o = r.lengthWords, a = r.paddingLengthBytes;
    s > 0 && (t |= 1 << Zo);
    let c = 0;
    if (e.setUint8(c, t), c += re, e.setUint8(c, 0), c += re, e.setUint16(c, this.trackHandle), c += dt, e.setUint16(c, this.sequence.value), c += dt, e.setUint16(c, this.frameNumber.value), c += dt, e.setUint32(c, this.timestamp.asTicks()), c += Ho, s > 0) {
      const l = o - 1;
      e.setUint16(c, l), c += dt;
      const u = this.extensions.toBinaryInto(new DataView(e.buffer, e.byteOffset + c));
      c += u;
      for (let h = 0; h < a; h += 1)
        e.setUint8(c, 0), c += re;
    }
    const d = this.toBinaryLengthBytes();
    if (c !== d)
      throw new Error("DataTrackPacketHeader.toBinaryInto: Wrote ".concat(c, " bytes but expected length was ").concat(d, " bytes"));
    return d;
  }
  static fromBinary(e) {
    const t = Ta(e);
    if (t.byteLength < Ko)
      throw Ce.tooShort();
    let n = 0;
    const r = t.getUint8(n);
    n += re;
    const s = r >> Go & ig;
    if (s > zo)
      throw Ce.unsupportedVersion(s);
    let o;
    switch (r >> Jo & rg) {
      case $o:
        o = Z.Start;
        break;
      case Qo:
        o = Z.Final;
        break;
      case Xo:
        o = Z.Single;
        break;
      case Yo:
      default:
        o = Z.Inter;
        break;
    }
    const a = (r >> Zo & sg) > 0;
    n += re;
    let c;
    try {
      c = og.fromNumber(t.getUint16(n));
    } catch (f) {
      throw f instanceof _n && (f.isReason(zt.Reserved) || f.isReason(zt.TooLarge)) ? Ce.invalidHandle(f) : f;
    }
    n += dt;
    const d = $e.u16(t.getUint16(n));
    n += dt;
    const l = $e.u16(t.getUint16(n));
    n += dt;
    const u = vn.fromRtpTicks(t.getUint32(n));
    n += Ho;
    let h = new bn();
    if (a) {
      if (t.byteLength - n < dt)
        throw Ce.missingExtWords();
      let f = t.getUint16(n);
      n += dt;
      let p = 4 * (f + 1) - gi;
      if (n + p > t.byteLength)
        throw Ce.headerOverrun();
      let y = new DataView(t.buffer, t.byteOffset + n, p);
      const k = bn.fromBinary(y), w = L(k, 2), A = w[0], b = w[1];
      h = A, n += b;
    }
    return [new ei({
      marker: o,
      trackHandle: c,
      sequence: d,
      frameNumber: l,
      timestamp: u,
      extensions: h
    }), n];
  }
  toJSON() {
    return {
      marker: this.marker,
      trackHandle: this.trackHandle,
      sequence: this.sequence.value,
      frameNumber: this.frameNumber.value,
      timestamp: this.timestamp.asTicks(),
      extensions: this.extensions.toJSON()
    };
  }
}
var Z;
(function(i) {
  i[i.Start = 0] = "Start", i[i.Inter = 1] = "Inter", i[i.Final = 2] = "Final", i[i.Single = 3] = "Single";
})(Z || (Z = {}));
class or extends ar {
  constructor(e, t) {
    super(), this.header = e, this.payload = t;
  }
  toBinaryLengthBytes() {
    return this.header.toBinaryLengthBytes() + this.payload.byteLength;
  }
  toBinaryInto(e) {
    let t = 0;
    const n = this.header.toBinaryInto(e);
    if (t += n, e.byteLength - t < this.payload.byteLength)
      throw Zn.tooSmallForPayload();
    for (let s = 0; s < this.payload.length; s += 1)
      e.setUint8(t, this.payload[s]), t += re;
    const r = this.toBinaryLengthBytes();
    if (t !== r)
      throw new Error("DataTrackPacket.toBinaryInto: Wrote ".concat(t, " bytes but expected length was ").concat(r, " bytes"));
    return r;
  }
  static fromBinary(e) {
    const t = Ta(e), n = ei.fromBinary(t), r = L(n, 2), s = r[0], o = r[1], a = t.buffer.slice(t.byteOffset + o, t.byteOffset + t.byteLength);
    return [new or(s, new Uint8Array(a)), t.byteLength];
  }
  toJSON() {
    return {
      header: this.header.toJSON(),
      payload: this.payload
    };
  }
}
class cr extends Ve {
  constructor(e, t, n) {
    super(19, e, n), this.name = "DataTrackPacketizerError", this.reason = t, this.reasonName = ji[t];
  }
  static mtuTooShort() {
    return new cr("MTU is too short to send frame", ji.MtuTooShort);
  }
}
var ji;
(function(i) {
  i[i.MtuTooShort = 0] = "MtuTooShort";
})(ji || (ji = {}));
class Sa {
  constructor(e, t) {
    this.sequence = $e.u16(0), this.frameNumber = $e.u16(0), this.clock = Bt.rtpStartingNow(vn.rtpRandom()), this.handle = e, this.mtuSizeBytes = t;
  }
  /** @internal */
  static computeFrameMarker(e, t) {
    return t <= 1 ? Z.Single : e === 0 ? Z.Start : e === t - 1 ? Z.Final : Z.Inter;
  }
  /** Generates a series of packets for the specified {@link DataTrackFrameInternal}.
   *
   * NOTE: The return value of this function is a generator, so it can be lazily ran if desired,
   * or converted to an array with {@link Array.from}.
   */
  *packetize(e, t) {
    var n;
    const r = this.frameNumber.getThenIncrement(), s = {
      marker: Z.Inter,
      trackHandle: this.handle,
      sequence: $e.u16(0),
      frameNumber: r,
      timestamp: (n = t?.now) !== null && n !== void 0 ? n : this.clock.now(),
      extensions: e.extensions
    }, o = new ei(s).toBinaryLengthBytes();
    if (o >= this.mtuSizeBytes)
      throw cr.mtuTooShort();
    const a = this.mtuSizeBytes - o, c = Math.ceil(e.payload.byteLength / a);
    for (let l = 0, u = 0; u < e.payload.byteLength; d = [l + 1, u + a], l = d[0], u = d[1], d) {
      var d;
      const h = this.sequence.getThenIncrement(), f = new ei(Object.assign(Object.assign({}, s), {
        marker: Sa.computeFrameMarker(l, c),
        sequence: h
      })), g = Math.min(
        // All but the last packet will be max length ...
        a,
        // ... and the last packet will be as long as it needs to be to finish out the buffer.
        e.payload.byteLength - u
      ), p = new Uint8Array(e.payload.buffer, e.payload.byteOffset + u, g);
      yield new or(f, p);
    }
  }
}
var He;
(function(i) {
  i[i.NotAllowed = 0] = "NotAllowed", i[i.DuplicateName = 1] = "DuplicateName", i[i.Timeout = 2] = "Timeout", i[i.LimitReached = 3] = "LimitReached", i[i.Disconnected = 4] = "Disconnected", i[i.Cancelled = 5] = "Cancelled", i[i.InvalidName = 6] = "InvalidName", i[i.Unknown = 7] = "Unknown";
})(He || (He = {}));
class ue extends Ve {
  constructor(e, t, n) {
    super(21, e, n), this.name = "DataTrackPublishError", this.reason = t, this.reasonName = He[t], this.rawMessage = n?.rawMessage;
  }
  static notAllowed(e) {
    return new ue("Data track publishing unauthorized", He.NotAllowed, {
      rawMessage: e
    });
  }
  static duplicateName(e) {
    return new ue("Track name already taken", He.DuplicateName, {
      rawMessage: e
    });
  }
  static invalidName(e) {
    return new ue("Track name is invalid", He.InvalidName, {
      rawMessage: e
    });
  }
  static timeout() {
    return new ue("Publish data track timed-out. Does the LiveKit server support data tracks?", He.Timeout);
  }
  static limitReached(e) {
    return new ue("Data track publication limit reached", He.LimitReached, {
      rawMessage: e
    });
  }
  static unknown(e, t) {
    return new ue("Received RequestResponse for publishDataTrack, but reason was unrecognised (".concat(e, ", ").concat(t, ")"), He.Unknown);
  }
  static disconnected() {
    return new ue("Room disconnected", He.Disconnected);
  }
  // NOTE: this was introduced by web / there isn't a corresponding case in the rust version.
  static cancelled() {
    return new ue("Publish data track cancelled by caller", He.Cancelled);
  }
}
var Vn;
(function(i) {
  i[i.TrackUnpublished = 0] = "TrackUnpublished", i[i.Dropped = 1] = "Dropped";
})(Vn || (Vn = {}));
class Pt extends Ve {
  constructor(e, t, n) {
    super(22, e, n), this.name = "DataTrackPushFrameError", this.reason = t, this.reasonName = Vn[t];
  }
  static trackUnpublished() {
    return new Pt("Track is no longer published", Vn.TrackUnpublished);
  }
  static dropped(e) {
    return new Pt("Frame was dropped", Vn.Dropped, {
      cause: e
    });
  }
}
var Wn;
(function(i) {
  i[i.Packetizer = 0] = "Packetizer", i[i.Encryption = 1] = "Encryption";
})(Wn || (Wn = {}));
class ti extends Ve {
  constructor(e, t, n) {
    super(21, e, n), this.name = "DataTrackOutgoingPipelineError", this.reason = t, this.reasonName = Wn[t];
  }
  static packetizer(e) {
    return new ti("Error packetizing frame", Wn.Packetizer, {
      cause: e
    });
  }
  static encryption(e) {
    return new ti("Error encrypting frame", Wn.Encryption, {
      cause: e
    });
  }
}
const _l = /* @__PURE__ */ Symbol.for("lk.track"), Pl = /* @__PURE__ */ Symbol.for("lk.data-track");
class dr {
  /** @internal */
  constructor(e, t) {
    this.trackSymbol = _l, this.isLocal = !0, this.typeSymbol = Pl, this.handle = null, this.log = q, this.flushedFuture = new ye(), this.isFlushed = !0, this.handleManagerReset = () => {
      var n, r;
      (r = (n = this.flushedFuture).resolve) === null || r === void 0 || r.call(n), this.manager.off("packetsFlushedChange", this.handleManagerPacketsFlushedChange), this.manager.off("reset", this.handleManagerReset);
    }, this.handleManagerPacketsFlushedChange = (n) => {
      var r, s;
      this.isFlushed = n.isFlushed, n.isFlushed && ((s = (r = this.flushedFuture).resolve) === null || s === void 0 || s.call(r), this.flushedFuture = new ye());
    }, this.options = e, this.manager = t, this.log = pe(ne.DataTracks), this.manager.on("packetsFlushedChange", this.handleManagerPacketsFlushedChange), this.manager.on("reset", this.handleManagerReset);
  }
  /** @internal */
  static withExplicitHandle(e, t, n) {
    const r = new dr(e, t);
    return r.handle = n, r;
  }
  /** Metrics about the data track publication. */
  get info() {
    const e = this.descriptor;
    if (e?.type === "active")
      return e.info;
  }
  /** The raw descriptor from the manager containing the internal state for this local track. */
  get descriptor() {
    return this.handle ? this.manager.getDescriptor(this.handle) : null;
  }
  /**
   * Publish the track to the SFU. This must be done before calling {@link tryPush} for the first time.
   * @internal
   * */
  publish(e) {
    return m(this, void 0, void 0, function* () {
      try {
        this.handle = yield this.manager.publishRequest(this.options, e);
      } catch (t) {
        throw t;
      }
    });
  }
  isPublished() {
    var e;
    return ((e = this.descriptor) === null || e === void 0 ? void 0 : e.type) === "active" && this.descriptor.publishState !== "unpublished";
  }
  /** Try pushing a frame to subscribers of the track.
   *
   * Pushing a frame can fail for several reasons:
   *
   * - The track has been unpublished by the local participant or SFU
   * - The room is no longer connected
   */
  tryPush(e) {
    if (!this.handle)
      throw Pt.trackUnpublished();
    const t = El.from(e);
    try {
      return this.manager.tryProcessAndSend(this.handle, t);
    } catch (n) {
      throw n;
    }
  }
  /**
   * When called, waits for all in flight packets to be sent before resolving.
   *
   * Use this to:
   *
   * 1. Send frames exactly in order:
   * ```ts
   * await track.tryPush(/* ... *\/);
   * await track.flush();
   * await track.tryPush(/* ... *\/);
   * await track.flush();
   * // ... etc ...
   * ```
   *
   * 2. Wait for frames to all be delivered before unpublishing a local data track:
   *
   * ```ts
   * await track.tryPush(/* ... *\/);
   * await track.tryPush(/* ... *\/);
   * await track.tryPush(/* ... *\/);
   * // ... etc ...
   * await track.flush();
   * await track.unpublish();
   * ```
   **/
  flush() {
    return m(this, void 0, void 0, function* () {
      if (!this.isFlushed)
        return this.flushedFuture.promise;
    });
  }
  /**
   * Unpublish the track from the SFU. Once this is called, any further calls to {@link tryPush}
   * will fail.
   * */
  unpublish() {
    return m(this, void 0, void 0, function* () {
      if (!this.handle) {
        q.warn('Data track "'.concat(this.options.name, '" is not published, so unpublishing has no effect.'));
        return;
      }
      try {
        yield this.manager.unpublishRequest(this.handle);
      } catch (e) {
        throw e;
      }
    });
  }
}
const Is = {
  from(i) {
    return {
      sid: i.sid,
      pubHandle: i.pubHandle,
      name: i.name,
      usesE2ee: i.encryption !== H.NONE
    };
  },
  toProtobuf(i) {
    return new $i({
      sid: i.sid,
      pubHandle: i.pubHandle,
      name: i.name,
      encryption: i.usesE2ee ? H.GCM : H.NONE
    });
  }
};
class Rl {
  /** @internal */
  constructor(e, t, n) {
    this.trackSymbol = _l, this.isLocal = !1, this.typeSymbol = Pl, this.info = e, this.manager = t, this.publisherIdentity = n.publisherIdentity;
  }
  /** Subscribes to the data track to receive frames.
   *
   * # Returns
   *
   * A stream that yields {@link DataTrackFrame}s as they arrive.
   *
   * # Multiple Subscriptions
   *
   * An application may call `subscribe` more than once to process frames in
   * multiple places. For example, one async task might plot values on a graph
   * while another writes them to a file.
   *
   * Internally, only the first call to `subscribe` communicates with the SFU and
   * allocates the resources required to receive frames. Additional subscriptions
   * reuse the same underlying pipeline and do not trigger additional signaling.
   *
   * Note that newly created subscriptions only receive frames published after
   * the initial subscription is established.
   */
  subscribe(e) {
    try {
      const t = this.manager.openSubscriptionStream(this.info.sid, e?.signal, e?.bufferSize), n = L(t, 2), r = n[0];
      return n[1].catch(() => {
      }), r;
    } catch (t) {
      throw t;
    }
  }
  /** Configure how incoming frames for this track are processed before they are handed out to
   * subscribers (the "pipeline"). These options apply to all current and future subscriptions
   * of this track, and may be set at any time. */
  setPipelineOptions(e) {
    this.manager.setPipelineOptions(this.info.sid, e);
  }
}
const dg = /* @__PURE__ */ Object.values(zn), lg = /* @__PURE__ */ Object.values(es), ug = /* @__PURE__ */ Object.values(Us), hg = [zn.h180, zn.h360], fg = [es.h180, es.h360], pg = (i) => [{
  scaleResolutionDownBy: 2,
  fps: i.encoding.maxFramerate
}].map((t) => {
  var n, r;
  return new Q(Math.floor(i.width / t.scaleResolutionDownBy), Math.floor(i.height / t.scaleResolutionDownBy), Math.max(15e4, Math.floor(i.encoding.maxBitrate / (Math.pow(t.scaleResolutionDownBy, 2) * (((n = i.encoding.maxFramerate) !== null && n !== void 0 ? n : 30) / ((r = t.fps) !== null && r !== void 0 ? r : 30))))), t.fps, i.encoding.priority);
}), As = ["q", "h", "f"];
function qi(i, e, t, n) {
  var r, s;
  let o = n?.videoEncoding;
  i && (o = n?.screenShareEncoding);
  const a = n?.simulcast, c = n?.scalabilityMode, d = n?.videoCodec, l = un(d, n);
  if (!o && !a && !c || !e || !t)
    return [{}];
  o || (o = gg(i, e, t, d), q.debug("using video encoding", o));
  const u = o.maxFramerate, h = new Q(e, t, o.maxBitrate, o.maxFramerate, o.priority);
  if (c && Lt(d) && !l) {
    const w = new Al(c), A = [];
    if (w.spatial > 3)
      throw new Error("unsupported scalabilityMode: ".concat(c));
    const b = ke();
    if (nl()) {
      const T = w.suffix == "h" ? 2 : 3, S = $f(b);
      for (let I = 0; I < w.spatial; I += 1)
        A.push({
          rid: As[2 - I],
          maxBitrate: o.maxBitrate / Math.pow(T, I),
          maxFramerate: h.encoding.maxFramerate,
          scaleResolutionDownBy: S ? Math.pow(2, I) : void 0
        });
      A[0].scalabilityMode = c;
    } else
      A.push({
        maxBitrate: o.maxBitrate,
        maxFramerate: h.encoding.maxFramerate,
        /* @ts-ignore */
        scalabilityMode: c
      });
    return h.encoding.priority && (A[0].priority = h.encoding.priority, A[0].networkPriority = h.encoding.priority), q.debug("using svc encoding", {
      encodings: A
    }), A;
  }
  if (!a)
    return [o];
  const f = (w) => (l && w.forEach((A) => {
    A.scalabilityMode = c;
  }), w);
  let g;
  i ? g = (r = tc(n?.screenShareSimulcastLayers)) !== null && r !== void 0 ? r : ec(i, h) : g = (s = tc(n?.videoSimulcastLayers)) !== null && s !== void 0 ? s : ec(i, h);
  let p;
  if (g.length > 0) {
    const w = g[0];
    if (g.length > 1) {
      var y = g, k = L(y, 2);
      p = k[1];
    }
    const A = Math.max(e, t);
    if (A >= 960 && p)
      return f(Ur(e, t, [w, p, h], u));
    if (A >= 480)
      return f(Ur(e, t, [w, h], u));
  }
  return f(Ur(e, t, [h]));
}
function mg(i, e, t) {
  var n, r;
  return Lt(i) && !un(i, e) ? (r = (n = t[0]) === null || n === void 0 ? void 0 : n.maxBitrate) !== null && r !== void 0 ? r : 0 : t.reduce((s, o) => {
    var a;
    return s + ((a = o.maxBitrate) !== null && a !== void 0 ? a : 0);
  }, 0);
}
function Il(i, e, t) {
  var n, r, s, o;
  if (!t.backupCodec || t.backupCodec === !0 || t.backupCodec.codec === t.videoCodec)
    return;
  e !== t.backupCodec.codec && q.warn("requested a different codec than specified as backup", {
    serverRequested: e,
    backup: t.backupCodec.codec
  }), t.videoCodec = e, t.videoEncoding = t.backupCodec.encoding;
  const a = i.mediaStreamTrack.getSettings(), c = (n = a.width) !== null && n !== void 0 ? n : (r = i.dimensions) === null || r === void 0 ? void 0 : r.width, d = (s = a.height) !== null && s !== void 0 ? s : (o = i.dimensions) === null || o === void 0 ? void 0 : o.height;
  return i.source === C.Source.ScreenShare && t.simulcast && (t.simulcast = !1), qi(i.source === C.Source.ScreenShare, c, d, t);
}
function gg(i, e, t, n) {
  const r = vg(i, e, t);
  let s = r[0].encoding;
  const o = Math.max(e, t);
  for (let a = 0; a < r.length; a += 1) {
    const c = r[a];
    if (s = c.encoding, c.width >= o)
      break;
  }
  if (n)
    switch (n) {
      case "av1":
      case "h265":
        s = Object.assign({}, s), s.maxBitrate = s.maxBitrate * 0.7;
        break;
      case "vp9":
        s = Object.assign({}, s), s.maxBitrate = s.maxBitrate * 0.85;
        break;
    }
  return s;
}
function vg(i, e, t) {
  if (i)
    return ug;
  const n = e > t ? e / t : t / e;
  return Math.abs(n - 16 / 9) < Math.abs(n - 4 / 3) ? dg : lg;
}
function ec(i, e) {
  if (i)
    return pg(e);
  const t = e.width, n = e.height, r = t > n ? t / n : n / t;
  return Math.abs(r - 16 / 9) < Math.abs(r - 4 / 3) ? hg : fg;
}
function Ur(i, e, t, n) {
  const r = [];
  if (t.forEach((s, o) => {
    if (o >= As.length)
      return;
    const a = Math.min(i, e), d = {
      rid: As[o],
      scaleResolutionDownBy: Math.max(1, a / Math.min(s.width, s.height)),
      maxBitrate: s.encoding.maxBitrate
    }, l = n && s.encoding.maxFramerate ? Math.min(n, s.encoding.maxFramerate) : s.encoding.maxFramerate;
    l && (d.maxFramerate = l);
    const u = ke(), h = u?.name === "Firefox" && u.os !== "iOS" || o === 0;
    s.encoding.priority && h && (d.priority = s.encoding.priority, d.networkPriority = s.encoding.priority), r.push(d);
  }), qe() && sl() === "ios") {
    let s;
    r.forEach((a) => {
      s ? a.maxFramerate && a.maxFramerate > s && (s = a.maxFramerate) : s = a.maxFramerate;
    });
    let o = !0;
    r.forEach((a) => {
      var c;
      a.maxFramerate != s && (o && (o = !1, q.info("Simulcast on iOS React-Native requires all encodings to share the same framerate.")), q.info('Setting framerate of encoding "'.concat((c = a.rid) !== null && c !== void 0 ? c : "", '" to ').concat(s)), a.maxFramerate = s);
    });
  }
  return r;
}
function tc(i) {
  if (i)
    return i.slice().sort((e, t) => {
      const n = e.encoding, r = t.encoding;
      return n.maxBitrate > r.maxBitrate ? 1 : n.maxBitrate < r.maxBitrate ? -1 : n.maxBitrate === r.maxBitrate && n.maxFramerate && r.maxFramerate ? n.maxFramerate > r.maxFramerate ? 1 : -1 : 0;
    });
}
class Al {
  constructor(e) {
    const t = e.match(/^L(\d)T(\d)(h|_KEY|_KEY_SHIFT){0,1}$/);
    if (!t)
      throw new Error("invalid scalability mode");
    if (this.spatial = parseInt(t[1]), this.temporal = parseInt(t[2]), t.length > 3)
      switch (t[3]) {
        case "h":
        case "_KEY":
        case "_KEY_SHIFT":
          this.suffix = t[3];
      }
  }
  toString() {
    var e;
    return "L".concat(this.spatial, "T").concat(this.temporal).concat((e = this.suffix) !== null && e !== void 0 ? e : "");
  }
}
function bg(i) {
  switch (i.source) {
    case C.Source.Camera:
      return "maintain-framerate";
    case C.Source.ScreenShare:
      return "maintain-resolution";
    default:
      return "balanced";
  }
}
const yg = 5e3;
class xl extends yl {
  get sender() {
    return this._sender;
  }
  set sender(e) {
    this._sender = e, this.degradationPreference && this.setDegradationPreference(this.degradationPreference);
  }
  /**
   *
   * @param mediaTrack
   * @param constraints MediaTrackConstraints that are being used when restarting or reacquiring tracks
   * @param userProvidedTrack Signals to the SDK whether or not the mediaTrack should be managed (i.e. released and reacquired) internally by the SDK
   */
  constructor(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0, r = arguments.length > 3 ? arguments[3] : void 0;
    super(e, C.Kind.Video, t, n, r), this.simulcastCodecs = /* @__PURE__ */ new Map(), this.degradationPreference = "balanced", this.isCpuConstrained = !1, this.optimizeForPerformance = !1, this.monitorSender = () => m(this, void 0, void 0, function* () {
      if (!this.sender) {
        this._currentBitrate = 0;
        return;
      }
      let s;
      try {
        s = yield this.getSenderStats();
      } catch (c) {
        this.log.error("could not get video sender stats", Object.assign(Object.assign({}, this.logContext), {
          error: c
        }));
        return;
      }
      const o = new Map(s.map((c) => [c.rid, c])), a = s.some((c) => c.qualityLimitationReason === "cpu");
      if (a !== this.isCpuConstrained && (this.isCpuConstrained = a, this.isCpuConstrained && this.emit(R.CpuConstrained)), this.prevStats) {
        let c = 0;
        o.forEach((d, l) => {
          var u;
          const h = (u = this.prevStats) === null || u === void 0 ? void 0 : u.get(l);
          c += rr(d, h);
        }), this._currentBitrate = c;
      }
      this.prevStats = o;
    }), this.senderLock = new fe();
  }
  get isSimulcast() {
    return !!(this.sender && this.sender.getParameters().encodings.length > 1);
  }
  /* @internal */
  startMonitor(e) {
    var t;
    this.signalClient = e;
    const n = (t = this.sender) === null || t === void 0 ? void 0 : t.getParameters();
    n && (this.encodings = n.encodings), _e() && (this.monitorInterval || (this.monitorInterval = setInterval(() => {
      this.monitorSender();
    }, va)));
  }
  stop() {
    this._mediaStreamTrack.getConstraints(), this.simulcastCodecs.forEach((e) => {
      e.mediaStreamTrack.stop();
    }), super.stop();
  }
  pauseUpstream() {
    const e = Object.create(null, {
      pauseUpstream: {
        get: () => super.pauseUpstream
      }
    });
    return m(this, void 0, void 0, function* () {
      var t, n, r, s, o;
      yield e.pauseUpstream.call(this);
      try {
        for (var a = !0, c = je(this.simulcastCodecs.values()), d; d = yield c.next(), t = d.done, !t; a = !0)
          s = d.value, a = !1, yield (o = s.sender) === null || o === void 0 ? void 0 : o.replaceTrack(null);
      } catch (l) {
        n = {
          error: l
        };
      } finally {
        try {
          !a && !t && (r = c.return) && (yield r.call(c));
        } finally {
          if (n) throw n.error;
        }
      }
    });
  }
  resumeUpstream() {
    const e = Object.create(null, {
      resumeUpstream: {
        get: () => super.resumeUpstream
      }
    });
    return m(this, void 0, void 0, function* () {
      var t, n, r, s, o;
      yield e.resumeUpstream.call(this);
      try {
        for (var a = !0, c = je(this.simulcastCodecs.values()), d; d = yield c.next(), t = d.done, !t; a = !0) {
          s = d.value, a = !1;
          const l = s;
          yield (o = l.sender) === null || o === void 0 ? void 0 : o.replaceTrack(l.mediaStreamTrack);
        }
      } catch (l) {
        n = {
          error: l
        };
      } finally {
        try {
          !a && !t && (r = c.return) && (yield r.call(c));
        } finally {
          if (n) throw n.error;
        }
      }
    });
  }
  mute() {
    const e = Object.create(null, {
      mute: {
        get: () => super.mute
      }
    });
    return m(this, void 0, void 0, function* () {
      const t = yield this.muteLock.lock();
      try {
        return this.isMuted ? (this.log.debug("Track already muted", this.logContext), this) : (this.source === C.Source.Camera && !this.isUserProvided && (this.log.debug("stopping camera track", this.logContext), this._mediaStreamTrack.stop()), yield e.mute.call(this), this);
      } finally {
        t();
      }
    });
  }
  unmute() {
    const e = Object.create(null, {
      unmute: {
        get: () => super.unmute
      }
    });
    return m(this, void 0, void 0, function* () {
      const t = yield this.muteLock.lock();
      try {
        return this.isMuted ? (this.source === C.Source.Camera && !this.isUserProvided && (this.log.debug("reacquiring camera track", this.logContext), yield this.restart(void 0, !0)), yield e.unmute.call(this), this) : (this.log.debug("Track already unmuted", this.logContext), this);
      } finally {
        t();
      }
    });
  }
  setTrackMuted(e) {
    super.setTrackMuted(e);
    for (const t of this.simulcastCodecs.values())
      t.mediaStreamTrack.enabled = !e;
  }
  getSenderStats() {
    return m(this, void 0, void 0, function* () {
      var e;
      if (!(!((e = this.sender) === null || e === void 0) && e.getStats))
        return [];
      const t = [], n = yield this.sender.getStats();
      return n.forEach((r) => {
        var s;
        if (r.type === "outbound-rtp") {
          const o = {
            type: "video",
            streamId: r.id,
            frameHeight: r.frameHeight,
            frameWidth: r.frameWidth,
            framesPerSecond: r.framesPerSecond,
            framesSent: r.framesSent,
            firCount: r.firCount,
            pliCount: r.pliCount,
            nackCount: r.nackCount,
            packetsSent: r.packetsSent,
            bytesSent: r.bytesSent,
            qualityLimitationReason: r.qualityLimitationReason,
            qualityLimitationDurations: r.qualityLimitationDurations,
            qualityLimitationResolutionChanges: r.qualityLimitationResolutionChanges,
            rid: (s = r.rid) !== null && s !== void 0 ? s : r.id,
            retransmittedPacketsSent: r.retransmittedPacketsSent,
            targetBitrate: r.targetBitrate,
            timestamp: r.timestamp
          }, a = n.get(r.remoteId);
          a && (o.jitter = a.jitter, o.packetsLost = a.packetsLost, o.roundTripTime = a.roundTripTime), t.push(o);
        }
      }), t.sort((r, s) => {
        var o, a;
        return ((o = s.frameWidth) !== null && o !== void 0 ? o : 0) - ((a = r.frameWidth) !== null && a !== void 0 ? a : 0);
      }), t;
    });
  }
  /**
   * Whether `codec` is being published as SVC (a single stream carrying all spatial
   * layers) as opposed to rid based simulcast. VP9/AV1 are SVC unless the publisher
   * opted into simulcast, in which case each rid is an independent stream and the
   * layers can be enabled/disabled individually.
   */
  isSvcPublish(e) {
    return Lt(e) && !un(e, this.publishOptions);
  }
  setPublishingQuality(e) {
    const t = [];
    for (let n = De.LOW; n <= De.HIGH; n += 1)
      t.push(new na({
        quality: n,
        enabled: n <= e
      }));
    this.log.debug("setting publishing quality. max quality ".concat(e), this.logContext), this.setPublishingLayers(this.isSvcPublish(this.codec), t);
  }
  restartTrack(e) {
    return m(this, void 0, void 0, function* () {
      var t, n, r, s, o;
      let a;
      if (e) {
        const u = aa({
          video: e
        });
        typeof u.video != "boolean" && (a = u.video);
      }
      yield this.restart(a), this.isCpuConstrained = !1;
      try {
        for (var c = !0, d = je(this.simulcastCodecs.values()), l; l = yield d.next(), t = l.done, !t; c = !0) {
          s = l.value, c = !1;
          const u = s;
          u.sender && ((o = u.sender.transport) === null || o === void 0 ? void 0 : o.state) !== "closed" && (u.mediaStreamTrack = this.mediaStreamTrack.clone(), yield u.sender.replaceTrack(u.mediaStreamTrack));
        }
      } catch (u) {
        n = {
          error: u
        };
      } finally {
        try {
          !c && !t && (r = d.return) && (yield r.call(d));
        } finally {
          if (n) throw n.error;
        }
      }
      yield this.onSenderTrackSwapped();
    });
  }
  onSenderTrackSwapped() {
    return m(this, void 0, void 0, function* () {
      yield this.refreshSenderEncodings();
    });
  }
  /**
   * Recomputes encoding parameters for this track's senders based on the current
   * MediaStreamTrack dimensions and reapplies them via setParameters. This is a no-op
   * if the track hasn't been published yet or if the track is in performance-optimized
   * mode (which manages its own encodings).
   */
  refreshSenderEncodings() {
    return m(this, void 0, void 0, function* () {
      var e;
      if (!this.sender || !this.publishOptions || this.optimizeForPerformance)
        return;
      const t = yield this.senderLock.lock();
      try {
        let r;
        try {
          r = yield this.waitForDimensions();
        } catch (a) {
          this.log.warn("could not determine new track dimensions, skipping encoding recompute", Object.assign(Object.assign({}, this.logContext), {
            error: a
          }));
          return;
        }
        if (this.lastEncodedDimensions && this.lastEncodedDimensions.width === r.width && this.lastEncodedDimensions.height === r.height)
          return;
        const s = this.source === C.Source.ScreenShare, o = qi(s, r.width, r.height, Object.assign({}, this.publishOptions));
        yield this.applyEncodingsToSender(this.sender, o), this.encodings = o, this.lastEncodedDimensions = r;
        for (const a of this.simulcastCodecs) {
          var n = L(a, 2);
          const c = n[0], d = n[1];
          if (!d.sender || ((e = d.sender.transport) === null || e === void 0 ? void 0 : e.state) === "closed" || !Yc(c))
            continue;
          const l = Object.assign({}, this.publishOptions), u = Il(this, c, l);
          u && (yield this.applyEncodingsToSender(d.sender, u), d.encodings = u);
        }
      } catch (r) {
        this.log.warn("failed to apply recomputed encodings", Object.assign(Object.assign({}, this.logContext), {
          error: r
        }));
      } finally {
        t();
      }
    });
  }
  applyEncodingsToSender(e, t) {
    return m(this, void 0, void 0, function* () {
      const n = e.getParameters();
      !n.encodings || n.encodings.length !== t.length || (n.encodings.forEach((r, s) => {
        if (r.active === !1)
          return;
        const o = t[s];
        o.scaleResolutionDownBy !== void 0 && (r.scaleResolutionDownBy = o.scaleResolutionDownBy), o.maxBitrate !== void 0 && (r.maxBitrate = o.maxBitrate), o.maxFramerate !== void 0 && (r.maxFramerate = o.maxFramerate), o.priority !== void 0 && (r.priority = o.priority, r.networkPriority = o.priority);
      }), this.log.debug("updating sender encodings after track restart", Object.assign(Object.assign({}, this.logContext), {
        encodings: n.encodings
      })), yield e.setParameters(n));
    });
  }
  /**
   * Sets a processor on this track, and wires its processed track into the simulcast codecs.
   *
   * The processor is destroyed when the track is stopped, which unpublishing and disconnecting
   * both do by default, so it has to be set again after reconnecting. See {@link TrackProcessor}
   * for the full lifecycle.
   */
  setProcessor(e) {
    const t = Object.create(null, {
      setProcessor: {
        get: () => super.setProcessor
      }
    });
    return m(this, arguments, void 0, function(n) {
      var r = this;
      let s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
      return (function* () {
        var o, a, c, d, l, u;
        if (yield t.setProcessor.call(r, n, s), !((l = r.processor) === null || l === void 0) && l.processedTrack)
          try {
            for (var h = !0, f = je(r.simulcastCodecs.values()), g; g = yield f.next(), o = g.done, !o; h = !0)
              d = g.value, h = !1, yield (u = d.sender) === null || u === void 0 ? void 0 : u.replaceTrack(r.processor.processedTrack);
          } catch (p) {
            a = {
              error: p
            };
          } finally {
            try {
              !h && !o && (c = f.return) && (yield c.call(f));
            } finally {
              if (a) throw a.error;
            }
          }
      })();
    });
  }
  setDegradationPreference(e) {
    return m(this, void 0, void 0, function* () {
      this.degradationPreference = e, yield this.applyDegradationPreference(this.sender);
      for (const t of this.simulcastCodecs.values())
        yield this.applyDegradationPreference(t.sender);
    });
  }
  /**
   * Degradation preference is a property of the sender, not of the track, so every sender
   * publishing this track needs it applied separately. A backup codec publishes over its
   * own sender, which would otherwise let the browser resolve a preference implicitly and
   * diverge from the primary encoder.
   *
   * Callers apply this sequentially rather than concurrently: `setParameters` is only valid
   * against the parameters most recently returned by `getParameters`, which is why this file
   * serializes other sender parameter updates through `senderLock`.
   */
  applyDegradationPreference(e) {
    return m(this, void 0, void 0, function* () {
      if (e)
        try {
          this.log.debug("setting degradationPreference to ".concat(this.degradationPreference), this.logContext);
          const t = e.getParameters();
          t.degradationPreference = this.degradationPreference, yield e.setParameters(t);
        } catch (t) {
          this.log.warn("failed to set degradationPreference", Object.assign({
            error: t
          }, this.logContext));
        }
    });
  }
  addSimulcastTrack(e, t) {
    if (this.simulcastCodecs.has(e)) {
      this.log.error("".concat(e, " already added, skipping adding simulcast codec"), this.logContext);
      return;
    }
    const n = {
      codec: e,
      mediaStreamTrack: this.mediaStreamTrack.clone(),
      sender: void 0,
      encodings: t
    };
    return this.simulcastCodecs.set(e, n), n;
  }
  setSimulcastTrackSender(e, t) {
    return m(this, void 0, void 0, function* () {
      const n = this.simulcastCodecs.get(e);
      n && (n.sender = t, yield this.applyDegradationPreference(t), setTimeout(() => {
        this.refreshSubscribedCodecs();
      }, yg));
    });
  }
  /** @interal */
  refreshSubscribedCodecs() {
    return m(this, void 0, void 0, function* () {
      if (this.subscribedCodecs)
        return this.setPublishingCodecs(this.subscribedCodecs).catch((e) => this.log.warn("failed to refresh codec for track", Object.assign(Object.assign({}, this.logContext), {
          error: e
        })));
    });
  }
  /**
   * @internal
   * Sets codecs that should be publishing, returns new codecs that have not yet
   * been published
   */
  setPublishingCodecs(e) {
    return m(this, void 0, void 0, function* () {
      var t, n, r, s, o, a, c;
      if (this.log.debug("setting publishing codecs", Object.assign(Object.assign({}, this.logContext), {
        codecs: e,
        currentCodec: this.codec
      })), !this.codec && e.length > 0)
        return yield this.setPublishingLayers(this.isSvcPublish(e[0].codec), e[0].qualities), [];
      this.subscribedCodecs = e;
      const d = [];
      try {
        for (t = !0, n = je(e); r = yield n.next(), s = r.done, !s; t = !0) {
          c = r.value, t = !1;
          const l = c;
          if (!this.codec || this.codec === l.codec)
            yield this.setPublishingLayers(this.isSvcPublish(l.codec), l.qualities);
          else {
            const u = this.simulcastCodecs.get(l.codec);
            if (this.log.debug("try setPublishingCodec for ".concat(l.codec), Object.assign(Object.assign({}, this.logContext), {
              simulcastCodecInfo: u
            })), !u || !u.sender) {
              for (const h of l.qualities)
                if (h.enabled) {
                  d.push(l.codec);
                  break;
                }
            } else u.encodings && (this.log.debug("try setPublishingLayersForSender ".concat(l.codec), this.logContext), yield nc(u.sender, u.encodings, l.qualities, this.senderLock, this.isSvcPublish(l.codec), this.log, this.logContext));
          }
        }
      } catch (l) {
        o = {
          error: l
        };
      } finally {
        try {
          !t && !s && (a = n.return) && (yield a.call(n));
        } finally {
          if (o) throw o.error;
        }
      }
      return d;
    });
  }
  /**
   * @internal
   * Sets layers that should be publishing
   */
  setPublishingLayers(e, t) {
    return m(this, void 0, void 0, function* () {
      if (this.optimizeForPerformance) {
        this.log.info("skipping setPublishingLayers due to optimized publishing performance", Object.assign(Object.assign({}, this.logContext), {
          qualities: t
        }));
        return;
      }
      this.log.debug("setting publishing layers", Object.assign(Object.assign({}, this.logContext), {
        qualities: t
      })), !(!this.sender || !this.encodings) && (yield nc(this.sender, this.encodings, t, this.senderLock, e, this.log, this.logContext));
    });
  }
  /**
   * Designed for lower powered devices, reduces video publishing quality and disables simulcast.
   * @experimental
   */
  prioritizePerformance() {
    return m(this, void 0, void 0, function* () {
      if (!this.sender)
        throw new Error("sender not found");
      const e = yield this.senderLock.lock();
      try {
        this.optimizeForPerformance = !0;
        const t = this.sender.getParameters();
        t.encodings = t.encodings.map((n, r) => {
          var s;
          return Object.assign(Object.assign({}, n), {
            active: r === 0,
            scaleResolutionDownBy: Math.max(1, Math.ceil(((s = this.mediaStreamTrack.getSettings().height) !== null && s !== void 0 ? s : 360) / 360)),
            scalabilityMode: r === 0 && Lt(this.codec) ? "L1T3" : void 0,
            maxFramerate: r === 0 ? 15 : 0,
            maxBitrate: r === 0 ? n.maxBitrate : 0
          });
        }), this.log.debug("setting performance optimised encodings", Object.assign(Object.assign({}, this.logContext), {
          encodings: t.encodings
        })), this.encodings = t.encodings, yield this.sender.setParameters(t);
      } catch (t) {
        this.log.error("failed to set performance optimised encodings", Object.assign(Object.assign({}, this.logContext), {
          error: t
        })), this.optimizeForPerformance = !1;
      } finally {
        e();
      }
    });
  }
  handleAppVisibilityChanged() {
    const e = Object.create(null, {
      handleAppVisibilityChanged: {
        get: () => super.handleAppVisibilityChanged
      }
    });
    return m(this, void 0, void 0, function* () {
      yield e.handleAppVisibilityChanged.call(this), il() && this.isInBackground && this.source === C.Source.Camera && (this._mediaStreamTrack.enabled = !1);
    });
  }
}
function nc(i, e, t, n, r, s, o) {
  return m(this, void 0, void 0, function* () {
    const a = yield n.lock();
    s.debug("setPublishingLayersForSender", Object.assign(Object.assign({}, o), {
      sender: i,
      qualities: t,
      senderEncodings: e
    }));
    try {
      const c = i.getParameters(), d = c.encodings;
      if (!d)
        return;
      if (d.length !== e.length) {
        s.warn("cannot set publishing layers, encodings mismatch", Object.assign(Object.assign({}, o), {
          encodings: d,
          senderEncodings: e
        }));
        return;
      }
      let l = !1;
      !1 && d[0].scalabilityMode || (r && t.some((f) => f.enabled) && t.forEach((f) => f.enabled = !0), d.forEach((h, f) => {
        var g;
        let p = (g = h.rid) !== null && g !== void 0 ? g : "";
        p === "" && (p = "q");
        const y = Ml(p), k = t.find((w) => w.quality === y);
        k && h.active !== k.enabled && (l = !0, h.active = k.enabled, s.debug("setting layer ".concat(k.quality, " to ").concat(h.active ? "enabled" : "disabled"), o), Qt() && (k.enabled ? (h.scaleResolutionDownBy = e[f].scaleResolutionDownBy, h.maxBitrate = e[f].maxBitrate, h.maxFrameRate = e[f].maxFrameRate) : (h.scaleResolutionDownBy = 4, h.maxBitrate = 10, h.maxFrameRate = 2)));
      })), l && (c.encodings = d, s.debug("setting encodings", Object.assign(Object.assign({}, o), {
        encodings: c.encodings
      })), yield i.setParameters(c));
    } finally {
      a();
    }
  });
}
function Ml(i) {
  switch (i) {
    case "f":
      return De.HIGH;
    case "h":
      return De.MEDIUM;
    case "q":
      return De.LOW;
    default:
      return De.HIGH;
  }
}
function Ol(i, e, t, n) {
  if (!t)
    return [new Rt({
      quality: De.HIGH,
      width: i,
      height: e,
      bitrate: 0,
      ssrc: 0
    })];
  if (n) {
    const r = t[0].scalabilityMode, s = new Al(r), o = [], a = s.suffix == "h" ? 1.5 : 2, c = s.suffix == "h" ? 2 : 3;
    for (let d = 0; d < s.spatial; d += 1)
      o.push(new Rt({
        quality: Math.min(De.HIGH, s.spatial - 1) - d,
        width: Math.ceil(i / Math.pow(a, d)),
        height: Math.ceil(e / Math.pow(a, d)),
        bitrate: t[0].maxBitrate ? Math.ceil(t[0].maxBitrate / Math.pow(c, d)) : 0,
        ssrc: 0
      }));
    return o;
  }
  return t.map((r) => {
    var s, o, a;
    const c = (s = r.scaleResolutionDownBy) !== null && s !== void 0 ? s : 1;
    let d = Ml((o = r.rid) !== null && o !== void 0 ? o : "");
    return new Rt({
      quality: d,
      width: Math.ceil(i / c),
      height: Math.ceil(e / c),
      bitrate: (a = r.maxBitrate) !== null && a !== void 0 ? a : 0,
      ssrc: 0
    });
  });
}
class Ll {
  get info() {
    return this._info;
  }
  /** @internal */
  validateBytesReceived() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !1;
    if (!(typeof this.totalByteSize != "number" || this.totalByteSize === 0)) {
      if (e && this.bytesReceived < this.totalByteSize)
        throw new ce("Not enough chunk(s) received - expected ".concat(this.totalByteSize, " bytes of data total, only received ").concat(this.bytesReceived, " bytes"), ee.Incomplete);
      if (this.bytesReceived > this.totalByteSize)
        throw new ce("Extra chunk(s) received - expected ".concat(this.totalByteSize, " bytes of data total, received ").concat(this.bytesReceived, " bytes"), ee.LengthExceeded);
    }
  }
  constructor(e, t, n) {
    this.reader = t, this.totalByteSize = n, this._info = e, this.bytesReceived = 0;
  }
  /**
   * Counts a chunk's bytes against `totalByteSize` and reports progress. Chunk ordering and
   * de-duplication happen upstream in the manager's `ensureOrderedChunks`, so every chunk reaching
   * here is new and in order.
   */
  handleChunkReceived(e) {
    var t;
    this.bytesReceived += e.content.byteLength, this.validateBytesReceived();
    const n = this.totalByteSize ? this.bytesReceived / this.totalByteSize : void 0;
    (t = this.onProgress) === null || t === void 0 || t.call(this, n);
  }
}
class ic extends Ll {
  [Symbol.asyncIterator]() {
    const e = this.reader.getReader();
    e.closed.catch(() => {
    });
    const t = (n) => {
      e.cancel(n).catch(() => {
      }), e.releaseLock(), this.signal = void 0;
    };
    return {
      next: () => m(this, void 0, void 0, function* () {
        var n;
        try {
          const r = this.signal;
          if (r?.aborted)
            throw r.reason;
          const s = yield new Promise((o, a) => {
            if (r) {
              const c = () => a(r.reason);
              r.addEventListener("abort", c, {
                once: !0
              }), e.read().then(o, a).finally(() => {
                r.removeEventListener("abort", c);
              });
            } else
              e.read().then(o, a);
          });
          return s.done ? (this.validateBytesReceived(!0), typeof this.totalByteSize == "number" && ((n = this.onProgress) === null || n === void 0 || n.call(this, 1)), {
            done: !0,
            value: void 0
          }) : (this.handleChunkReceived(s.value), {
            done: !1,
            value: s.value.content
          });
        } catch (r) {
          throw t(r), r;
        }
      }),
      // note: `return` runs only for premature exits, see:
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#errors_during_iteration
      return() {
        return m(this, void 0, void 0, function* () {
          return t(), {
            done: !0,
            value: void 0
          };
        });
      }
    };
  }
  /**
   * Injects an AbortSignal, which if aborted, will terminate the currently active
   * stream iteration operation.
   *
   * Note that when using AbortSignal.timeout(...), the timeout applies across
   * the whole iteration operation, not just one individual chunk read.
   */
  withAbortSignal(e) {
    return this.signal = e, this;
  }
  readAll() {
    return m(this, arguments, void 0, function() {
      var e = this;
      let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      return (function* () {
        var n, r, s, o;
        let a = /* @__PURE__ */ new Set();
        const c = t.signal ? e.withAbortSignal(t.signal) : e;
        try {
          for (var d = !0, l = je(c), u; u = yield l.next(), n = u.done, !n; d = !0) {
            o = u.value, d = !1;
            const h = o;
            a.add(h);
          }
        } catch (h) {
          r = {
            error: h
          };
        } finally {
          try {
            !d && !n && (s = l.return) && (yield s.call(l));
          } finally {
            if (r) throw r.error;
          }
        }
        return Array.from(a);
      })();
    });
  }
}
class rc extends Ll {
  /**
   * Async iterator implementation to allow usage of `for await...of` syntax.
   * Yields each chunk's decoded text as it arrives - a delta, not the string accumulated so far.
   */
  [Symbol.asyncIterator]() {
    const e = this.reader.getReader();
    e.closed.catch(() => {
    });
    const t = new TextDecoder("utf-8"), n = this.signal, r = (s) => {
      e.cancel(s).catch(() => {
      }), e.releaseLock(), this.signal = void 0;
    };
    return {
      next: () => m(this, void 0, void 0, function* () {
        var s;
        try {
          if (n?.aborted)
            throw n.reason;
          const o = yield new Promise((a, c) => {
            if (n) {
              const d = () => c(n.reason);
              n.addEventListener("abort", d, {
                once: !0
              }), e.read().then(a, c).finally(() => {
                n.removeEventListener("abort", d);
              });
            } else
              e.read().then(a, c);
          });
          if (o.done)
            return this.validateBytesReceived(!0), typeof this.totalByteSize == "number" && ((s = this.onProgress) === null || s === void 0 || s.call(this, 1)), {
              done: !0,
              value: void 0
            };
          {
            this.handleChunkReceived(o.value);
            let a;
            try {
              a = t.decode(o.value.content);
            } catch (c) {
              throw new ce("Cannot decode datastream chunk ".concat(o.value.chunkIndex, " as text: ").concat(c), ee.DecodeFailed);
            }
            return {
              done: !1,
              value: a
            };
          }
        } catch (o) {
          throw r(o), o;
        }
      }),
      // note: `return` runs only for premature exits, see:
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#errors_during_iteration
      return() {
        return m(this, void 0, void 0, function* () {
          return r(), {
            done: !0,
            value: void 0
          };
        });
      }
    };
  }
  /**
   * Injects an AbortSignal, which if aborted, will terminate the currently active
   * stream iteration operation.
   *
   * Note that when using AbortSignal.timeout(...), the timeout applies across
   * the whole iteration operation, not just one individual chunk read.
   */
  withAbortSignal(e) {
    return this.signal = e, this;
  }
  readAll() {
    return m(this, arguments, void 0, function() {
      var e = this;
      let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      return (function* () {
        var n, r, s, o;
        let a = "";
        const c = t.signal ? e.withAbortSignal(t.signal) : e;
        try {
          for (var d = !0, l = je(c), u; u = yield l.next(), n = u.done, !n; d = !0)
            o = u.value, d = !1, a += o;
        } catch (h) {
          r = {
            error: h
          };
        } finally {
          try {
            !d && !n && (s = l.return) && (yield s.call(l));
          } finally {
            if (r) throw r.error;
          }
        }
        return a;
      })();
    });
  }
}
class G extends Error {
  /**
   * Creates an error object with the given code and message, plus an optional data payload.
   *
   * If thrown in an RPC method handler, the error will be sent back to the caller.
   *
   * Error codes 1001-1999 are reserved for built-in errors (see RpcError.ErrorCode for their meanings).
   */
  constructor(e, t, n, r) {
    super(t), this.code = e, this.message = sc(t, G.MAX_MESSAGE_BYTES), this.data = n ? sc(n, G.MAX_DATA_BYTES) : void 0, typeof r?.cause < "u" && (this.cause = r?.cause);
  }
  /**
   * @internal
   */
  static fromProto(e) {
    return new G(e.code, e.message, e.data);
  }
  /**
   * @internal
   */
  toProto() {
    return new _d({
      code: this.code,
      message: this.message,
      data: this.data
    });
  }
  /**
   * Creates an error object from the code, with an auto-populated message.
   *
   * @internal
   */
  static builtIn(e, t, n) {
    return new G(G.ErrorCode[e], G.ErrorMessage[e], t, n);
  }
}
G.MAX_MESSAGE_BYTES = 256;
G.MAX_DATA_BYTES = 15360;
G.ErrorCode = {
  APPLICATION_ERROR: 1500,
  CONNECTION_TIMEOUT: 1501,
  RESPONSE_TIMEOUT: 1502,
  RECIPIENT_DISCONNECTED: 1503,
  RESPONSE_PAYLOAD_TOO_LARGE: 1504,
  SEND_FAILED: 1505,
  UNSUPPORTED_METHOD: 1400,
  RECIPIENT_NOT_FOUND: 1401,
  REQUEST_PAYLOAD_TOO_LARGE: 1402,
  UNSUPPORTED_SERVER: 1403,
  UNSUPPORTED_VERSION: 1404
};
G.ErrorMessage = {
  APPLICATION_ERROR: "Application error in method handler",
  CONNECTION_TIMEOUT: "Connection timeout",
  RESPONSE_TIMEOUT: "Response timeout",
  RECIPIENT_DISCONNECTED: "Recipient disconnected",
  RESPONSE_PAYLOAD_TOO_LARGE: "Response payload too large",
  SEND_FAILED: "Failed to send",
  UNSUPPORTED_METHOD: "Method not supported at destination",
  RECIPIENT_NOT_FOUND: "Recipient not found",
  REQUEST_PAYLOAD_TOO_LARGE: "Request payload too large",
  UNSUPPORTED_SERVER: "RPC not supported by server",
  UNSUPPORTED_VERSION: "Unsupported RPC version"
};
const Dl = 15360, Nl = "lk.rpc_request", Ul = "lk.rpc_response";
var ve;
(function(i) {
  i.RPC_REQUEST_ID = "lk.rpc_request_id", i.RPC_REQUEST_METHOD = "lk.rpc_request_method", i.RPC_REQUEST_RESPONSE_TIMEOUT_MS = "lk.rpc_request_response_timeout_ms", i.RPC_REQUEST_VERSION = "lk.rpc_request_version";
})(ve || (ve = {}));
const kg = 1, Fl = 2;
function Ca(i) {
  return new TextEncoder().encode(i).length;
}
function sc(i, e) {
  if (Ca(i) <= e)
    return i;
  let t = 0, n = i.length;
  const r = new TextEncoder();
  for (; t < n; ) {
    const o = Math.floor((t + n + 1) / 2);
    r.encode(i.slice(0, o)).length <= e ? t = o : n = o - 1;
  }
  const s = t > 0 ? i.charCodeAt(t - 1) : 0;
  return s >= 55296 && s <= 56319 && (t -= 1), i.slice(0, t);
}
class Tg extends xe.EventEmitter {
  constructor(e, t, n, r) {
    super(), this.pendingAcks = /* @__PURE__ */ new Map(), this.pendingResponses = /* @__PURE__ */ new Map(), this.log = e, this.outgoingDataStreamManager = t, this.getRemoteParticipantClientProtocol = n, this.getServerVersion = r;
  }
  performRpc(e) {
    return m(this, arguments, void 0, function(t) {
      var n = this;
      let r = t.destinationIdentity, s = t.method, o = t.payload, a = t.responseTimeout, c = a === void 0 ? 15e3 : a;
      return (function* () {
        const u = n.getRemoteParticipantClientProtocol(r);
        if (Ca(o) > Dl && u < ls)
          throw G.builtIn("REQUEST_PAYLOAD_TOO_LARGE");
        const f = n.getServerVersion();
        if (f && Ye(f, "1.8.0") < 0)
          throw G.builtIn("UNSUPPORTED_SERVER");
        const g = Math.max(c, 8e3), p = crypto.randomUUID(), y = new ye();
        let k = null;
        const w = setTimeout(() => {
          var b;
          n.pendingAcks.delete(p), (b = y.reject) === null || b === void 0 || b.call(y, G.builtIn("CONNECTION_TIMEOUT")), n.pendingResponses.delete(p), k !== null && clearTimeout(k);
        }, 7e3);
        n.pendingAcks.set(p, {
          resolve: () => {
            clearTimeout(w);
          },
          participantIdentity: r
        }), n.pendingResponses.set(p, {
          completionFuture: y,
          participantIdentity: r
        });
        const A = y.promise.finally(() => {
          k !== null && clearTimeout(k), n.pendingAcks.has(p) && (n.log.warn("RPC response received before ack", p), n.pendingAcks.delete(p), clearTimeout(w));
        });
        A.catch(() => {
        });
        try {
          yield n.publishRpcRequest(r, p, s, o, g, u);
        } catch (b) {
          throw clearTimeout(w), n.pendingAcks.delete(p), n.pendingResponses.delete(p), b;
        }
        return n.pendingResponses.has(p) && (k = setTimeout(() => {
          var b;
          n.pendingResponses.delete(p), (b = y.reject) === null || b === void 0 || b.call(y, G.builtIn("RESPONSE_TIMEOUT"));
        }, c)), [p, A];
      })();
    });
  }
  publishRpcRequest(e, t, n, r, s, o) {
    return m(this, void 0, void 0, function* () {
      if (o >= ls) {
        yield this.outgoingDataStreamManager.sendText(r, {
          topic: Nl,
          destinationIdentities: [e],
          attributes: {
            [ve.RPC_REQUEST_ID]: t,
            [ve.RPC_REQUEST_METHOD]: n,
            [ve.RPC_REQUEST_RESPONSE_TIMEOUT_MS]: "".concat(s),
            [ve.RPC_REQUEST_VERSION]: "".concat(Fl)
          }
        });
        return;
      }
      this.emit("sendDataPacket", {
        packet: new Ae({
          destinationIdentities: [e],
          kind: It.RELIABLE,
          value: {
            case: "rpcRequest",
            value: new Ks({
              id: t,
              method: n,
              payload: r,
              responseTimeoutMs: s,
              version: kg
            })
          }
        })
      });
    });
  }
  /**
   * Handle an incoming data stream containing an RPC response payload.
   * @internal
   */
  handleIncomingDataStream(e, t, n) {
    return m(this, void 0, void 0, function* () {
      const r = n[ve.RPC_REQUEST_ID];
      if (!r) {
        this.log.warn("RPC data stream malformed: ".concat(ve.RPC_REQUEST_ID, " not set."));
        return;
      }
      const s = this.pendingResponses.get(r);
      if (s && s.participantIdentity !== t) {
        this.log.warn("RPC response stream for ".concat(r, " arrived from unexpected sender ").concat(t, ", expected ").concat(s.participantIdentity, ". Ignoring."));
        return;
      }
      let o;
      try {
        o = yield e.readAll();
      } catch (a) {
        this.log.warn("Error reading RPC response payload: ".concat(a)), this.handleIncomingRpcResponseFailure(r, G.builtIn("APPLICATION_ERROR", "Error reading RPC response payload", {
          cause: a
        }));
        return;
      }
      this.handleIncomingRpcResponseSuccess(r, o);
    });
  }
  /** @internal */
  handleIncomingRpcResponseSuccess(e, t) {
    var n, r;
    const s = this.pendingResponses.get(e);
    s ? ((r = (n = s.completionFuture).resolve) === null || r === void 0 || r.call(n, t), this.pendingResponses.delete(e)) : this.log.error("Response received for unexpected RPC request", e);
  }
  /** @internal */
  handleIncomingRpcResponseFailure(e, t) {
    var n, r;
    const s = this.pendingResponses.get(e);
    s ? ((r = (n = s.completionFuture).reject) === null || r === void 0 || r.call(n, t), this.pendingResponses.delete(e)) : this.log.error("Response received for unexpected RPC request", e);
  }
  /** @internal */
  handleIncomingRpcAck(e) {
    const t = this.pendingAcks.get(e);
    t ? (t.resolve(), this.pendingAcks.delete(e)) : this.log.error("Ack received for unexpected RPC request: ".concat(e));
  }
  /** @internal */
  handleParticipantDisconnected(e) {
    var t;
    for (const o of this.pendingAcks) {
      var n = L(o, 2);
      const a = n[0];
      n[1].participantIdentity === e && this.pendingAcks.delete(a);
    }
    for (const o of this.pendingResponses) {
      var r = L(o, 2);
      const a = r[0];
      var s = r[1];
      const c = s.participantIdentity, d = s.completionFuture;
      c === e && ((t = d.reject) === null || t === void 0 || t.call(d, G.builtIn("RECIPIENT_DISCONNECTED")), this.pendingResponses.delete(a));
    }
  }
}
class Sg extends xe.EventEmitter {
  constructor(e, t, n) {
    super(), this.rpcHandlers = /* @__PURE__ */ new Map(), this.log = e, this.outgoingDataStreamManager = t, this.getRemoteParticipantClientProtocol = n;
  }
  registerRpcMethod(e, t) {
    if (this.rpcHandlers.has(e))
      throw Error("RPC handler already registered for method ".concat(e, ", unregisterRpcMethod before trying to register again"));
    this.rpcHandlers.set(e, t);
  }
  unregisterRpcMethod(e) {
    this.rpcHandlers.delete(e);
  }
  /**
   * Handle an incoming RPCRequest message containing a payload.
   * This handles "version 1" of rpc requests.
   * @internal
   */
  handleIncomingRpcRequest(e, t) {
    return m(this, void 0, void 0, function* () {
      var n;
      if (this.publishRpcAck(e, t.id), t.version !== 1) {
        this.publishRpcResponsePacket(e, t.id, null, G.builtIn("UNSUPPORTED_VERSION"));
        return;
      }
      const r = this.rpcHandlers.get(t.method);
      if (!r) {
        this.publishRpcResponsePacket(e, t.id, null, G.builtIn("UNSUPPORTED_METHOD"));
        return;
      }
      let s;
      try {
        s = yield r({
          requestId: t.id,
          callerIdentity: e,
          payload: t.payload,
          responseTimeout: t.responseTimeoutMs
        });
      } catch (o) {
        let a;
        o instanceof G ? a = o : (this.log.warn("Uncaught error returned by RPC handler for ".concat(t.method, ". Returning APPLICATION_ERROR instead."), o), a = G.builtIn("APPLICATION_ERROR", "Uncaught error: ".concat((n = o?.message) !== null && n !== void 0 ? n : o), {
          cause: o
        })), this.publishRpcResponsePacket(e, t.id, null, a);
        return;
      }
      yield this.publishRpcResponse(e, t.id, s ?? "");
    });
  }
  /**
   * Handle an incoming data stream containing a RPC request payload.
   * This handles "version 2" of rpc requests.
   * @internal
   */
  handleIncomingDataStream(e, t, n) {
    return m(this, void 0, void 0, function* () {
      const r = n[ve.RPC_REQUEST_ID], s = n[ve.RPC_REQUEST_METHOD], o = parseInt(n[ve.RPC_REQUEST_RESPONSE_TIMEOUT_MS], 10), a = parseInt(n[ve.RPC_REQUEST_VERSION], 10);
      if (!r || !s || Number.isNaN(o) || Number.isNaN(a)) {
        this.log.warn("RPC data stream malformed: ".concat(ve.RPC_REQUEST_ID, " / ").concat(ve.RPC_REQUEST_METHOD, " / ").concat(ve.RPC_REQUEST_RESPONSE_TIMEOUT_MS, " / ").concat(ve.RPC_REQUEST_VERSION, " not set.")), this.publishRpcResponsePacket(t, r, null, G.builtIn("APPLICATION_ERROR", "RPC data stream malformed"));
        return;
      }
      if (this.publishRpcAck(t, r), a !== Fl) {
        this.publishRpcResponsePacket(t, r, null, G.builtIn("UNSUPPORTED_VERSION"));
        return;
      }
      let c;
      try {
        c = yield e.readAll();
      } catch (u) {
        this.log.warn("Error reading RPC request payload: ".concat(u)), this.publishRpcResponsePacket(t, r, null, G.builtIn("APPLICATION_ERROR", "Error reading RPC request payload", {
          cause: u
        }));
        return;
      }
      const d = this.rpcHandlers.get(s);
      if (!d) {
        this.publishRpcResponsePacket(t, r, null, G.builtIn("UNSUPPORTED_METHOD"));
        return;
      }
      let l;
      try {
        l = yield d({
          requestId: r,
          callerIdentity: t,
          payload: c,
          responseTimeout: o
        });
      } catch (u) {
        let h;
        u instanceof G ? h = u : (this.log.warn("Uncaught error returned by RPC handler for ".concat(s, ". Returning APPLICATION_ERROR instead."), u), h = G.builtIn("APPLICATION_ERROR")), this.publishRpcResponsePacket(t, r, null, h);
        return;
      }
      yield this.publishRpcResponse(t, r, l ?? "");
    });
  }
  publishRpcAck(e, t) {
    this.emit("sendDataPacket", {
      packet: new Ae({
        destinationIdentities: [e],
        kind: It.RELIABLE,
        value: {
          case: "rpcAck",
          value: new Qi({
            requestId: t
          })
        }
      })
    });
  }
  publishRpcResponsePacket(e, t, n, r) {
    this.emit("sendDataPacket", {
      packet: new Ae({
        destinationIdentities: [e],
        kind: It.RELIABLE,
        value: {
          case: "rpcResponse",
          value: new Gs({
            requestId: t,
            value: r ? {
              case: "error",
              value: r.toProto()
            } : {
              case: "payload",
              value: n ?? ""
            }
          })
        }
      })
    });
  }
  /**
   * Send a successful RPC response payload, choosing the transport based on
   * the caller's client protocol version.
   */
  publishRpcResponse(e, t, n) {
    return m(this, void 0, void 0, function* () {
      if (this.getRemoteParticipantClientProtocol(e) >= ls) {
        yield this.outgoingDataStreamManager.sendText(n, {
          topic: Ul,
          destinationIdentities: [e],
          attributes: {
            [ve.RPC_REQUEST_ID]: t
          }
        });
        return;
      }
      if (Ca(n) > Dl) {
        this.log.warn("RPC Response payload too large for request ".concat(t, ". To send larger responses, consider updating the sending client.")), this.publishRpcResponsePacket(e, t, null, G.builtIn("RESPONSE_PAYLOAD_TOO_LARGE"));
        return;
      }
      this.publishRpcResponsePacket(e, t, n, null);
    });
  }
}
const Cg = 300;
class wg {
  constructor() {
    this.metadataMap = /* @__PURE__ */ new Map(), this.activeSsrc = 0;
  }
  storeMetadata(e, t, n) {
    for (this.activeSsrc !== 0 && this.activeSsrc !== t && this.metadataMap.clear(), this.activeSsrc = t; this.metadataMap.size >= Cg; ) {
      const r = this.metadataMap.keys().next().value;
      this.metadataMap.delete(r);
    }
    this.metadataMap.set(e, n);
  }
  lookupMetadata(e) {
    return this.metadataMap.get(e);
  }
  dispose() {
    this.metadataMap.clear(), this.activeSsrc = 0;
  }
}
class Eg {
  constructor(e) {
    this.extractors = /* @__PURE__ */ new Map(), this.workerPipelines = /* @__PURE__ */ new Map(), this.onWorkerMessage = (t) => {
      const n = t.data;
      if (n.kind === "metadata") {
        const r = this.extractors.get(n.data.trackId);
        r && r.storeMetadata(n.data.rtpTimestamp, n.data.ssrc, n.data.metadata);
      }
    }, this.onWorkerError = (t) => {
      q.error("frame metadata worker encountered an error:", {
        error: t.error
      });
    }, this.worker = e?.worker;
  }
  /** @internal */
  setup(e) {
    e !== this.room && (this.room = e, this.worker && (this.worker.onmessage = this.onWorkerMessage, this.worker.onerror = this.onWorkerError, this.worker.postMessage({
      kind: "init"
    })), e.on(_.TrackSubscribed, (t, n, r) => {
      t.kind === "video" && this.setupReceiver(t, n.trackInfo);
    }).on(_.TrackUnsubscribed, (t) => {
      this.teardownTrack(t);
    }).on(_.Disconnected, () => {
      this.cleanup();
    }));
  }
  setupReceiver(e, t) {
    var n, r, s;
    const o = e.receiver;
    if (!o)
      return;
    if (!(!!t?.packetTrailerFeatures && t.packetTrailerFeatures.length > 0)) {
      !((n = this.room) === null || n === void 0) && n.hasE2EESetup || this.setupPassthroughReceiver(o, e.mediaStreamID);
      return;
    }
    if (!Xn(this.worker ? {
      worker: this.worker
    } : void 0) && !(!((r = this.room) === null || r === void 0) && r.hasE2EESetup)) {
      q.warn("frame metadata transform not supported; skipping extraction");
      return;
    }
    const c = new wg(), d = e.mediaStreamID;
    this.extractors.set(d, c), e.frameMetadataExtractor = c, !(!((s = this.room) === null || s === void 0) && s.hasE2EESetup) && this.setupWorkerReceiver(o, d, !0);
  }
  setupPassthroughReceiver(e, t) {
    if (Yn()) {
      "transform" in e && (e.transform = null);
      return;
    }
    if (this.worker && Xn({
      worker: this.worker
    }) && !this.workerPipelines.has(e)) {
      this.setupWorkerReceiver(e, t, !1);
      return;
    }
    this.worker && this.workerPipelines.has(e) && this.setupWorkerReceiver(e, t, !1);
  }
  setupWorkerReceiver(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
    const r = this.worker;
    if (!r)
      return;
    if (Yn()) {
      e.transform = new RTCRtpScriptTransform(r, {
        kind: "decode",
        trackId: t
      });
      return;
    }
    const s = this.workerPipelines.get(e);
    if (s) {
      const c = {
        kind: "updateTrackId",
        data: {
          oldTrackId: s,
          newTrackId: t,
          hasPacketTrailer: n
        }
      };
      r.postMessage(c), this.workerPipelines.set(e, t);
      return;
    }
    if (!("createEncodedStreams" in e)) {
      q.warn("createEncodedStreams not supported");
      return;
    }
    let o;
    try {
      o = e.createEncodedStreams();
    } catch (c) {
      q.warn("failed to create encoded streams", {
        error: c
      });
      return;
    }
    const a = {
      kind: "decode",
      data: {
        readableStream: o.readable,
        writableStream: o.writable,
        trackId: t,
        hasPacketTrailer: n
      }
    };
    r.postMessage(a, [o.readable, o.writable]), this.workerPipelines.set(e, t);
  }
  teardownTrack(e) {
    const t = e.mediaStreamID, n = this.extractors.get(t);
    n && (n.dispose(), this.extractors.delete(t)), e instanceof ya && (e.frameMetadataExtractor = void 0);
  }
  /** Drops the per-connection state. The worker stays, because the room can connect again. */
  cleanup() {
    for (const e of this.extractors.values())
      e.dispose();
    this.extractors.clear(), this.workerPipelines.clear();
  }
  /** Terminates the worker. Called from `Room.dispose()`; the room cannot connect afterwards. */
  dispose() {
    var e;
    this.cleanup(), (e = this.worker) === null || e === void 0 || e.terminate();
  }
}
function _g(i, e) {
  const t = new wn(i);
  return bl(t, e ?? []), t;
}
function Fr() {
  return new CompressionStream("deflate-raw");
}
function Bl() {
  return new DecompressionStream("deflate-raw");
}
function ac(i, e) {
  return m(this, void 0, void 0, function* () {
    const t = new DecompressionStream("deflate-raw"), n = t.writable.getWriter();
    return n.write(i).catch(() => {
    }), n.close().catch(() => {
    }), jl(t.readable, e);
  });
}
function jl(i, e) {
  return m(this, void 0, void 0, function* () {
    const t = i.getReader(), n = [];
    let r = 0;
    for (; ; ) {
      const a = yield t.read(), c = a.done, d = a.value;
      if (c)
        break;
      if (n.push(d), r += d.byteLength, typeof e == "number" && r > e)
        throw yield t.cancel(), new ce("Decompressed payload exceeds the maximum payload size of ".concat(e, " bytes"), ee.PayloadTooLarge);
    }
    const s = new Uint8Array(r);
    let o = 0;
    for (const a of n)
      s.set(a, o), o += a.byteLength;
    return s;
  });
}
const jt = 15e3, Pg = 5e9, Rg = 500;
class Ig {
  constructor() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, t = e.maxPayloadByteLength, n = t === void 0 ? Pg : t, r = e.maxOpenStreamsPerParticipant, s = r === void 0 ? Rg : r;
    this.log = q, this.byteStreamControllers = /* @__PURE__ */ new Map(), this.textStreamControllers = /* @__PURE__ */ new Map(), this.byteStreamHandlers = /* @__PURE__ */ new Map(), this.textStreamHandlers = /* @__PURE__ */ new Map(), this.isConnected = !1, this.bufferedPackets = [], this.maxPayloadByteLength = n, this.maxOpenStreamsPerParticipant = s;
  }
  setConnected(e) {
    this.isConnected = e, e && this.flushBufferedPackets();
  }
  flushBufferedPackets() {
    const e = this.bufferedPackets;
    this.bufferedPackets = [];
    for (const t of e) {
      const n = t.packet, r = t.encryptionType;
      this.handleDataStreamPacket(n, r);
    }
  }
  registerTextStreamHandler(e, t) {
    if (this.textStreamHandlers.has(e))
      throw new ce('A text stream handler for topic "'.concat(e, '" has already been set.'), ee.HandlerAlreadyRegistered);
    this.textStreamHandlers.set(e, t);
  }
  unregisterTextStreamHandler(e) {
    this.textStreamHandlers.delete(e);
  }
  registerByteStreamHandler(e, t) {
    if (this.byteStreamHandlers.has(e))
      throw new ce('A byte stream handler for topic "'.concat(e, '" has already been set.'), ee.HandlerAlreadyRegistered);
    this.byteStreamHandlers.set(e, t);
  }
  unregisterByteStreamHandler(e) {
    this.byteStreamHandlers.delete(e);
  }
  clearControllers() {
    const e = new ce("Room disconnected in the middle of receiving data", ee.AbnormalEnd);
    for (const t of this.byteStreamControllers.values())
      t.controller.error(e);
    for (const t of this.textStreamControllers.values())
      t.controller.error(e);
    this.byteStreamControllers.clear(), this.textStreamControllers.clear(), this.bufferedPackets = [];
  }
  validateParticipantHasNoActiveDataStreams(e) {
    const t = Array.from(this.textStreamControllers.entries()).filter((o) => o[1].sendingParticipantIdentity === e), n = Array.from(this.byteStreamControllers.entries()).filter((o) => o[1].sendingParticipantIdentity === e);
    if (t.length > 0 || n.length > 0) {
      const o = new ce("Participant ".concat(e, " unexpectedly disconnected in the middle of sending data"), ee.AbnormalEnd);
      for (const a of n) {
        var r = L(a, 2);
        const c = r[0];
        r[1].controller.error(o), this.byteStreamControllers.delete(c);
      }
      for (const a of t) {
        var s = L(a, 2);
        const c = s[0];
        s[1].controller.error(o), this.textStreamControllers.delete(c);
      }
    }
  }
  handleDataStreamPacket(e, t) {
    if (!this.isConnected) {
      this.bufferedPackets.push({
        packet: e,
        encryptionType: t
      });
      return;
    }
    switch (e.value.case) {
      case "streamHeader":
        return this.handleStreamHeader(e.value.value, e.participantIdentity, t);
      case "streamChunk":
        return this.handleStreamChunk(e.value.value, t);
      case "streamTrailer":
        return this.handleStreamTrailer(e.value.value, t);
      default:
        throw new Error('DataPacket of value "'.concat(e.value.case, '" is not data stream related!'));
    }
  }
  /** Returns true if the given participant already has the maximum number of streams open. */
  hasTooManyOpenStreams(e) {
    let t = 0;
    for (const n of [this.byteStreamControllers, this.textStreamControllers])
      for (const r of n.values())
        r.sendingParticipantIdentity === e && (t += 1);
    return t >= this.maxOpenStreamsPerParticipant;
  }
  handleStreamHeader(e, t, n) {
    var r;
    if (this.hasTooManyOpenStreams(t)) {
      this.log.error("Participant ".concat(t, " already has ").concat(this.maxOpenStreamsPerParticipant, " data streams open, dropping stream ").concat(e.streamId));
      return;
    }
    switch (e.contentHeader.case) {
      case "byteHeader": {
        const s = this.byteStreamHandlers.get(e.topic);
        if (!s) {
          this.log.debug("ignoring incoming byte stream due to no handler for topic", e.topic);
          return;
        }
        let o;
        const a = {
          id: e.streamId,
          name: (r = e.contentHeader.value.name) !== null && r !== void 0 ? r : "unknown",
          mimeType: e.mimeType,
          size: e.totalLength ? Number(e.totalLength) : void 0,
          topic: e.topic,
          timestamp: tn(e.timestamp),
          attributes: e.attributes,
          encryptionType: n
        };
        let c;
        switch (e.compression) {
          case Se.DEFLATE_RAW:
            if (!pn()) {
              q.warn("Data stream ".concat(e.streamId, " received with deflate-raw compression, but this browser does not support deflate-raw decompression. Dropping..."));
              return;
            }
            c = !0;
            break;
          case Se.NONE:
            c = !1;
            break;
          default:
            q.warn("Data stream ".concat(e.streamId, " received with unknown compression type ").concat(e.compression, ", dropping..."));
            return;
        }
        const d = e.inlineContent;
        if (typeof d < "u") {
          s(new ic(a, oc(e.streamId, c ? ac(d, this.maxPayloadByteLength) : d), tn(e.totalLength)), {
            identity: t
          });
          return;
        }
        const l = new ReadableStream({
          start: (u) => {
            if (o = u, this.byteStreamControllers.has(e.streamId))
              throw new ce("A data stream read is already in progress for a stream with id ".concat(e.streamId, "."), ee.AlreadyOpened);
            this.byteStreamControllers.set(e.streamId, {
              info: a,
              controller: o,
              startTime: Date.now(),
              sendingParticipantIdentity: t
            });
          },
          cancel: () => {
            var u;
            ((u = this.byteStreamControllers.get(e.streamId)) === null || u === void 0 ? void 0 : u.controller) === o && this.byteStreamControllers.delete(e.streamId);
          }
        });
        s(new ic(
          a,
          c ? Mg(l, e.streamId, this.maxPayloadByteLength) : l.pipeThrough(Vi(e.streamId)),
          // `totalLength` is the pre-compression size, and the reader counts decompressed bytes,
          // so it applies to both paths (mirrors text).
          tn(e.totalLength)
        ), {
          identity: t
        });
        return;
      }
      case "textHeader": {
        const s = this.textStreamHandlers.get(e.topic);
        if (!s) {
          this.log.debug("ignoring incoming text stream due to no handler for topic", e.topic);
          return;
        }
        let o;
        const a = {
          id: e.streamId,
          mimeType: e.mimeType,
          size: e.totalLength ? Number(e.totalLength) : void 0,
          topic: e.topic,
          timestamp: Number(e.timestamp),
          attributes: e.attributes,
          encryptionType: n,
          attachedStreamIds: e.contentHeader.value.attachedStreamIds
        };
        let c;
        switch (e.compression) {
          case Se.DEFLATE_RAW:
            if (!pn()) {
              q.warn("Data stream ".concat(e.streamId, " received with deflate-raw compression, but this browser does not support deflate-raw decompression. Dropping..."));
              return;
            }
            c = !0;
            break;
          case Se.NONE:
            c = !1;
            break;
          default:
            q.warn("Data stream ".concat(e.streamId, " received with unknown compression type ").concat(e.compression, ", dropping..."));
            return;
        }
        const d = e.inlineContent;
        if (typeof d < "u") {
          const u = c ? ac(d, this.maxPayloadByteLength) : d;
          s(new rc(a, oc(e.streamId, u), tn(e.totalLength)), {
            identity: t
          });
          return;
        }
        const l = new ReadableStream({
          start: (u) => {
            if (o = u, this.textStreamControllers.has(e.streamId))
              throw new ce("A data stream read is already in progress for a stream with id ".concat(e.streamId, "."), ee.AlreadyOpened);
            this.textStreamControllers.set(e.streamId, {
              info: a,
              controller: o,
              startTime: Date.now(),
              sendingParticipantIdentity: t
            });
          },
          cancel: () => {
            var u;
            ((u = this.textStreamControllers.get(e.streamId)) === null || u === void 0 ? void 0 : u.controller) === o && this.textStreamControllers.delete(e.streamId);
          }
        });
        s(new rc(
          a,
          c ? Og(l, e.streamId, this.maxPayloadByteLength) : l.pipeThrough(Vi(e.streamId)),
          // `totalLength` is the pre-compression size, and the reader sees decompressed bytes, so
          // it applies to both paths.
          tn(e.totalLength)
        ), {
          identity: t
        });
        return;
      }
    }
  }
  handleStreamChunk(e, t) {
    const n = this.byteStreamControllers.get(e.streamId);
    n && (n.info.encryptionType !== t ? (n.controller.error(new ce("Encryption type mismatch for stream ".concat(e.streamId, ". Expected ").concat(t, ", got ").concat(n.info.encryptionType), ee.EncryptionTypeMismatch)), this.byteStreamControllers.delete(e.streamId)) : n.controller.enqueue(e));
    const r = this.textStreamControllers.get(e.streamId);
    r && (r.info.encryptionType !== t ? (r.controller.error(new ce("Encryption type mismatch for stream ".concat(e.streamId, ". Expected ").concat(t, ", got ").concat(r.info.encryptionType), ee.EncryptionTypeMismatch)), this.textStreamControllers.delete(e.streamId)) : r.controller.enqueue(e));
  }
  handleStreamTrailer(e, t) {
    const n = this.textStreamControllers.get(e.streamId);
    n && (n.info.encryptionType !== t ? n.controller.error(new ce("Encryption type mismatch for stream ".concat(e.streamId, ". Expected ").concat(t, ", got ").concat(n.info.encryptionType), ee.EncryptionTypeMismatch)) : (n.info.attributes = Object.assign(Object.assign({}, n.info.attributes), e.attributes), e.reason ? n.controller.error(new ce("Data stream ".concat(e.streamId, " closed abnormally: ").concat(e.reason), ee.AbnormalEnd)) : n.controller.close()), this.textStreamControllers.delete(e.streamId));
    const r = this.byteStreamControllers.get(e.streamId);
    r && (r.info.encryptionType !== t ? r.controller.error(new ce("Encryption type mismatch for stream ".concat(e.streamId, ". Expected ").concat(t, ", got ").concat(r.info.encryptionType), ee.EncryptionTypeMismatch)) : (r.info.attributes = Object.assign(Object.assign({}, r.info.attributes), e.attributes), e.reason ? r.controller.error(new ce("Data stream ".concat(e.streamId, " closed abnormally: ").concat(e.reason), ee.AbnormalEnd)) : r.controller.close()), this.byteStreamControllers.delete(e.streamId));
  }
}
function oc(i, e) {
  return new ReadableStream({
    start: (t) => m(this, void 0, void 0, function* () {
      const n = yield e;
      t.enqueue(new vt({
        streamId: i,
        chunkIndex: BigInt(0),
        content: n
      })), t.close();
    })
  });
}
function Vi(i) {
  let e = -1;
  return new TransformStream({
    transform: (t, n) => {
      const r = tn(t.chunkIndex);
      if (r <= e) {
        q.warn("ignoring duplicate chunk ".concat(r, " ").concat(t.version > 0 ? "(version ".concat(t.version, ")") : "", " for data stream ").concat(i, " (last processed: ").concat(e, ")"));
        return;
      }
      if (r > e + 1)
        throw new ce("Missing chunk(s) ".concat(e + 1, "..").concat(r - 1, " for data stream ").concat(i, " - cannot reassemble payload"), ee.Incomplete);
      e = r, t.content.length !== 0 && n.enqueue(t);
    }
  });
}
function ql() {
  return new TransformStream({
    transform: (i, e) => {
      e.enqueue(i.content);
    }
  });
}
function Ag(i) {
  let e = 0;
  return new TransformStream({
    transform: (t, n) => {
      t.byteLength > 0 && (n.enqueue(new vt({
        streamId: i,
        chunkIndex: Qe(e),
        content: t
      })), e += 1);
    }
  });
}
function xg(i) {
  const e = new TextDecoder("utf-8"), t = new TextEncoder();
  let n = 0;
  const r = (s) => {
    try {
      return s ? e.decode(s, {
        stream: !0
      }) : e.decode();
    } catch (o) {
      throw new ce("Cannot decode compressed data stream ".concat(i, " as text: ").concat(o), ee.DecodeFailed);
    }
  };
  return new TransformStream({
    transform: (s, o) => {
      const a = r(s);
      a.length > 0 && (o.enqueue(new vt({
        streamId: i,
        chunkIndex: Qe(n),
        content: t.encode(a)
      })), n += 1);
    },
    flush: (s) => {
      const o = r();
      o.length > 0 && (s.enqueue(new vt({
        streamId: i,
        chunkIndex: Qe(n),
        content: t.encode(o)
      })), n += 1);
    }
  });
}
function Mg(i, e, t) {
  return i.pipeThrough(Vi(e)).pipeThrough(ql()).pipeThrough(Bl()).pipeThrough(Vl(e, t)).pipeThrough(Ag(e));
}
function Og(i, e, t) {
  return i.pipeThrough(Vi(e)).pipeThrough(ql()).pipeThrough(Bl()).pipeThrough(Vl(e, t)).pipeThrough(xg(e));
}
function Vl(i, e) {
  let t = 0;
  return new TransformStream({
    transform: (n, r) => {
      if (t += n.byteLength, t > e)
        throw new ce("Data stream ".concat(i, " exceeds the maximum payload size of ").concat(e, " bytes"), ee.PayloadTooLarge);
      r.enqueue(n);
    }
  });
}
class Wl {
  constructor(e, t, n) {
    this.writableStream = e, this.defaultWriter = e.getWriter(), this.onClose = n, this.info = t;
  }
  write(e) {
    return this.defaultWriter.write(e);
  }
  close() {
    return m(this, void 0, void 0, function* () {
      var e;
      yield this.defaultWriter.close(), this.defaultWriter.releaseLock(), (e = this.onClose) === null || e === void 0 || e.call(this);
    });
  }
}
class Lg extends Wl {
}
class Dg extends Wl {
}
function Br(i, e, t) {
  var n;
  return new Yi({
    streamId: i.id,
    mimeType: i.mimeType,
    topic: i.topic,
    timestamp: Qe(i.timestamp),
    totalLength: Qe(i.size),
    attributes: i.attributes,
    compression: (n = t?.compression) !== null && n !== void 0 ? n : Se.NONE,
    inlineContent: t?.inlineContent,
    contentHeader: {
      case: "textHeader",
      value: new Ld({
        version: e?.version,
        attachedStreamIds: i.attachedStreamIds,
        replyToStreamId: e?.replyToStreamId,
        operationType: e?.type === "update" ? is.UPDATE : is.CREATE
      })
    }
  });
}
function vi(i, e) {
  var t;
  return new Yi({
    streamId: i.id,
    mimeType: i.mimeType,
    topic: i.topic,
    timestamp: Qe(i.timestamp),
    totalLength: Qe(i.size),
    attributes: i.attributes,
    compression: (t = e?.compression) !== null && t !== void 0 ? t : Se.NONE,
    inlineContent: e?.inlineContent,
    contentHeader: {
      case: "byteHeader",
      value: new Dd({
        name: i.name
      })
    }
  });
}
function Ut(i, e) {
  return new Ae({
    destinationIdentities: e,
    value: {
      case: "streamHeader",
      value: i
    }
  });
}
const Ng = /* @__PURE__ */ new TextEncoder();
class Ug {
  constructor(e, t, n, r, s) {
    this.engine = e, this.log = t, this.getRemoteParticipantClientProtocol = n, this.getRemoteParticipantCapabilities = r, this.getAllRemoteParticipantIdentities = s;
  }
  setupEngine(e) {
    this.engine = e;
  }
  /** {@inheritDoc LocalParticipant.sendText} */
  sendText(e, t) {
    return m(this, void 0, void 0, function* () {
      var n, r, s, o, a;
      const c = crypto.randomUUID(), d = Ng.encode(e), l = d.byteLength, u = (n = t?.compress) !== null && n !== void 0 ? n : !0;
      let h = {
        id: c,
        mimeType: "text/plain",
        timestamp: Date.now(),
        topic: (r = t?.topic) !== null && r !== void 0 ? r : "",
        size: l,
        // NOTE: size is always the pre-compression byte length
        attributes: t?.attributes,
        encryptionType: !((s = this.engine.e2eeManager) === null || s === void 0) && s.isDataChannelEncryptionEnabled ? H.GCM : H.NONE
      }, g = u && pn() && this.allRecipientsSupportV2(t?.destinationIdentities) && this.allRecipientsSupportCompression(t?.destinationIdentities) ? Wi.fromStream(xi(d).pipeThrough(Fr())) : null;
      if ((!t?.attachments || t.attachments.length === 0) && this.allRecipientsSupportV2(t?.destinationIdentities)) {
        let b = d, T = Se.NONE;
        if (g) {
          const O = yield g.collect();
          O.byteLength < d.byteLength && (b = O, T = Se.DEFLATE_RAW);
        }
        const S = Br(h, void 0, {
          compression: T,
          inlineContent: b
        }), I = Ut(S, t?.destinationIdentities);
        if (I.toBinary().byteLength <= jt)
          return yield this.engine.sendDataPacket(I, j.RELIABLE), (o = t?.onProgress) === null || o === void 0 || o.call(t, 1), h;
      }
      const y = (a = t?.attachments) === null || a === void 0 ? void 0 : a.map(() => crypto.randomUUID()), k = y ? y.length + 1 : 1, w = new Array(k).fill(0), A = (b, T) => {
        var S;
        w[T] = b, (S = t?.onProgress) === null || S === void 0 || S.call(t, w.reduce((I, O) => I + O, 0) / k);
      };
      if (g) {
        h.attachedStreamIds = y;
        const b = Br(h, void 0, {
          compression: Se.DEFLATE_RAW
        }), T = Ut(b, t?.destinationIdentities);
        yield this.sendChunkedByteStream(T, c, t?.destinationIdentities, g.stream().pipeThrough(jr(d.length, (S) => A(S, 0)))), d.length === 0 && A(1, 0);
      } else {
        const b = yield this.streamText({
          streamId: c,
          totalSize: l,
          destinationIdentities: t?.destinationIdentities,
          topic: t?.topic,
          attachedStreamIds: y,
          attributes: t?.attributes
        });
        yield b.write(e), A(1, 0), yield b.close(), h = b.info;
      }
      return t?.attachments && y && (yield Promise.all(t.attachments.map((b, T) => m(this, void 0, void 0, function* () {
        return this._sendFile(y[T], b, {
          topic: t.topic,
          mimeType: b.type,
          destinationIdentities: t.destinationIdentities,
          compress: t.compress,
          onProgress: (S) => {
            A(S, T + 1);
          }
        });
      })))), h;
    });
  }
  /**
   * Sends a complete in-memory byte payload. Mirrors {@link sendText}'s semantics: when every
   * recipient supports data streams v2 the payload rides inline in a single header packet
   * (optionally deflate-raw compressed), otherwise it is sent as a (optionally compressed)
   * chunked byte stream. Unlike {@link sendFile}, the whole payload is already in memory, so the
   * inline single-packet fast path applies.
   */
  sendBytes(e, t) {
    return m(this, void 0, void 0, function* () {
      var n, r, s, o, a, c, d;
      const l = crypto.randomUUID(), u = t?.destinationIdentities, h = (n = t?.compress) !== null && n !== void 0 ? n : !0, f = {
        id: l,
        name: (r = t?.name) !== null && r !== void 0 ? r : "unknown",
        mimeType: (s = t?.mimeType) !== null && s !== void 0 ? s : "application/octet-stream",
        timestamp: Date.now(),
        topic: (o = t?.topic) !== null && o !== void 0 ? o : "",
        size: e.byteLength,
        // NOTE: size is always the pre-compression byte length
        attributes: t?.attributes,
        encryptionType: !((a = this.engine.e2eeManager) === null || a === void 0) && a.isDataChannelEncryptionEnabled ? H.GCM : H.NONE
      }, g = jr(e.length, t?.onProgress);
      let y = h && pn() && this.allRecipientsSupportV2(u) && this.allRecipientsSupportCompression(u) ? Wi.fromStream(xi(e).pipeThrough(g).pipeThrough(Fr())) : null;
      if (this.allRecipientsSupportV2(u)) {
        let b = e, T = Se.NONE;
        if (y) {
          const O = yield y.collect();
          O.byteLength < e.byteLength && (b = O, T = Se.DEFLATE_RAW);
        }
        const S = vi(f, {
          compression: T,
          inlineContent: b
        }), I = Ut(S, u);
        if (I.toBinary().byteLength <= jt)
          return yield this.engine.sendDataPacket(I, j.RELIABLE), (c = t?.onProgress) === null || c === void 0 || c.call(t, 1), f;
      }
      const k = vi(f, {
        compression: y ? Se.DEFLATE_RAW : Se.NONE
      }), w = Ut(k, u), A = y ? y.stream() : xi(e).pipeThrough(g);
      return yield this.sendChunkedByteStream(w, l, u, A), e.length === 0 && ((d = t?.onProgress) === null || d === void 0 || d.call(t, 1)), f;
    });
  }
  /**
   * Returns true only if every recipient is known to support data streams v2 (single-packet inline
   * streams and compression). For a targeted send this checks the named destination identities; for
   * a broadcast (no explicit destinations) it checks every remote participant currently in the room.
   * An empty room (nobody to receive) is considered eligible.
   */
  allRecipientsSupportV2(e) {
    return (e && e.length > 0 ? e : this.getAllRemoteParticipantIdentities()).every((n) => this.getRemoteParticipantClientProtocol(n) >= Qd);
  }
  /**
   * Returns true only if every recipient advertises the deflate-raw compression capability (so it
   * can decompress a compressed stream). Resolved the same way as {@link allRecipientsSupportV2}:
   * named destinations, or every remote participant for a broadcast; an empty room is eligible.
   */
  allRecipientsSupportCompression(e) {
    return (e && e.length > 0 ? e : this.getAllRemoteParticipantIdentities()).every((n) => this.getRemoteParticipantCapabilities(n).includes(Jn.CAP_COMPRESSION_DEFLATE_RAW));
  }
  /**
   * Shared chunked-stream send for `sendText`/`sendFile`: sends the prebuilt header packet, then
   * forwards `source` (optionally deflate-raw compressed) as `streamChunk` packets re-chunked to
   * the MTU budget with contiguous indices, then sends the trailer. The source is consumed
   * incrementally, so a `file.stream()` is never buffered in full. The platform compressor can't
   * flush mid-stream, so compression is only used when the whole payload is available as a stream
   * up front (not for incremental writers like `streamText`/`streamBytes`).
   */
  sendChunkedByteStream(e, t, n, r) {
    return m(this, void 0, void 0, function* () {
      var s, o, a, c;
      const d = this.engine;
      yield qr(d, e);
      let l = 0;
      try {
        for (var u = !0, h = je(dp(r, jt)), f; f = yield h.next(), s = f.done, !s; u = !0) {
          c = f.value, u = !1;
          const g = c, p = new Ae({
            destinationIdentities: n,
            value: {
              case: "streamChunk",
              value: new vt({
                content: g,
                streamId: t,
                chunkIndex: Qe(l)
              })
            }
          });
          yield d.sendDataPacket(p, j.RELIABLE), l += 1;
        }
      } catch (g) {
        o = {
          error: g
        };
      } finally {
        try {
          !u && !s && (a = h.return) && (yield a.call(h));
        } finally {
          if (o) throw o.error;
        }
      }
      yield Vr(t, n, d);
    });
  }
  /**
   * @internal
   */
  streamText(e) {
    return m(this, void 0, void 0, function* () {
      var t, n, r;
      const s = (t = e?.streamId) !== null && t !== void 0 ? t : crypto.randomUUID(), o = e?.destinationIdentities, a = {
        id: s,
        mimeType: "text/plain",
        timestamp: Date.now(),
        topic: (n = e?.topic) !== null && n !== void 0 ? n : "",
        size: e?.totalSize,
        attributes: e?.attributes,
        encryptionType: !((r = this.engine.e2eeManager) === null || r === void 0) && r.isDataChannelEncryptionEnabled ? H.GCM : H.NONE,
        attachedStreamIds: e?.attachedStreamIds
      }, c = Br(a, e), d = Ut(c, o);
      yield qr(this.engine, d);
      let l = 0;
      const u = this.engine, h = new WritableStream({
        write(p) {
          return m(this, void 0, void 0, function* () {
            for (const y of cp(p, jt)) {
              const k = new vt({
                content: y,
                streamId: s,
                chunkIndex: Qe(l)
              }), w = new Ae({
                destinationIdentities: o,
                value: {
                  case: "streamChunk",
                  value: k
                }
              });
              yield u.sendDataPacket(w, j.RELIABLE), l += 1;
            }
          });
        },
        close() {
          return m(this, void 0, void 0, function* () {
            yield Vr(s, o, u);
          });
        },
        abort(p) {
          console.log("Sink error:", p);
        }
      });
      let f = () => m(this, void 0, void 0, function* () {
        yield g.close();
      });
      u.once(P.Closing, f);
      const g = new Lg(h, a, () => this.engine.off(P.Closing, f));
      return g;
    });
  }
  sendFile(e, t) {
    return m(this, void 0, void 0, function* () {
      const n = crypto.randomUUID();
      return yield this._sendFile(n, e, t), {
        id: n
      };
    });
  }
  /**
   * Streams a file as a chunked byte stream, compressed (deflate-raw) when the runtime supports it
   * and every recipient is on data streams v2. The file is piped `file.stream()` →
   * (`CompressionStream`) → chunk packets via {@link sendChunkedByteStream}, so it is never fully
   * buffered in memory — unlike {@link sendBytes}, there is no inline single-packet fast path for
   * files (the compressed size can't be known up front without buffering the whole file).
   */
  _sendFile(e, t, n) {
    return m(this, void 0, void 0, function* () {
      var r, s, o, a, c;
      const d = n?.destinationIdentities, l = ((r = n?.compress) !== null && r !== void 0 ? r : !0) && pn() && this.allRecipientsSupportV2(d) && this.allRecipientsSupportCompression(d), u = {
        id: e,
        name: t.name,
        mimeType: (s = n?.mimeType) !== null && s !== void 0 ? s : t.type,
        topic: (o = n?.topic) !== null && o !== void 0 ? o : "",
        timestamp: Date.now(),
        size: t.size,
        encryptionType: !((a = this.engine.e2eeManager) === null || a === void 0) && a.isDataChannelEncryptionEnabled ? H.GCM : H.NONE
      }, h = vi(u, {
        compression: l ? Se.DEFLATE_RAW : Se.NONE
      }), f = Ut(h, d), g = t.stream().pipeThrough(jr(t.size, n?.onProgress)), p = l ? g.pipeThrough(Fr()) : g;
      return yield this.sendChunkedByteStream(f, e, d, p), t.size === 0 && ((c = n?.onProgress) === null || c === void 0 || c.call(n, 1)), u;
    });
  }
  streamBytes(e) {
    return m(this, void 0, void 0, function* () {
      var t, n, r, s, o;
      const a = (t = e?.streamId) !== null && t !== void 0 ? t : crypto.randomUUID(), c = e?.destinationIdentities, d = {
        id: a,
        mimeType: (n = e?.mimeType) !== null && n !== void 0 ? n : "application/octet-stream",
        topic: (r = e?.topic) !== null && r !== void 0 ? r : "",
        timestamp: Date.now(),
        attributes: e?.attributes,
        size: e?.totalSize,
        name: (s = e?.name) !== null && s !== void 0 ? s : "unknown",
        encryptionType: !((o = this.engine.e2eeManager) === null || o === void 0) && o.isDataChannelEncryptionEnabled ? H.GCM : H.NONE
      }, l = vi(d), u = Ut(l, c);
      yield qr(this.engine, u);
      let h = 0;
      const f = new fe(), g = this.engine, p = this.log, y = new WritableStream({
        write(w) {
          return m(this, void 0, void 0, function* () {
            const A = yield f.lock();
            let b = 0;
            try {
              for (; b < w.byteLength; ) {
                const T = w.slice(b, b + jt), S = new Ae({
                  destinationIdentities: c,
                  value: {
                    case: "streamChunk",
                    value: new vt({
                      content: T,
                      streamId: a,
                      chunkIndex: Qe(h)
                    })
                  }
                });
                yield g.sendDataPacket(S, j.RELIABLE), h += 1, b += T.byteLength;
              }
            } finally {
              A();
            }
          });
        },
        close() {
          return m(this, void 0, void 0, function* () {
            yield Vr(a, c, g);
          });
        },
        abort(w) {
          p.error("Sink error:", w);
        }
      });
      return new Dg(y, d);
    });
  }
}
class Wi {
  constructor(e) {
    this.state = e;
  }
  static fromStream(e) {
    return new Wi({
      type: "stream",
      stream: e
    });
  }
  /** Collect data from the stream into memory and return as a Uint8Array. */
  collect() {
    return m(this, void 0, void 0, function* () {
      switch (this.state.type) {
        case "stream":
          const e = yield jl(this.state.stream);
          return this.state = {
            type: "collected",
            bytes: e
          }, e;
        case "collected":
          return this.state.bytes;
      }
    });
  }
  /** Pass wrapped stream through to downstream consumer. */
  stream() {
    switch (this.state.type) {
      case "stream":
        return this.state.stream;
      case "collected":
        return xi(this.state.bytes);
    }
  }
}
function jr(i, e) {
  let t = 0;
  return new TransformStream({
    transform(n, r) {
      t += n.byteLength, e && typeof i == "number" && i > 0 && e(Math.min(t / i, 1)), r.enqueue(n);
    }
  });
}
function qr(i, e) {
  return m(this, void 0, void 0, function* () {
    if (e.toBinary().byteLength > jt)
      throw new ce("data stream header exceeds the ".concat(jt, "-byte limit; reduce attribute size"), ee.HeaderTooLarge);
    yield i.sendDataPacket(e, j.RELIABLE);
  });
}
function Vr(i, e, t) {
  return m(this, void 0, void 0, function* () {
    const n = new Ae({
      destinationIdentities: e,
      value: {
        case: "streamTrailer",
        value: new Js({
          streamId: i
        })
      }
    });
    yield t.sendDataPacket(n, j.RELIABLE);
  });
}
const Hi = /* @__PURE__ */ ga("dataStreams", [], (i, e, t) => {
  const n = new Ig(t ?? i.options.dataStream), r = new Ug(i.engine, e.log, (o) => {
    var a, c;
    return (c = (a = i.remoteParticipants.get(o)) === null || a === void 0 ? void 0 : a.clientProtocol) !== null && c !== void 0 ? c : ra;
  }, (o) => {
    var a, c;
    return (c = (a = i.remoteParticipants.get(o)) === null || a === void 0 ? void 0 : a.capabilities) !== null && c !== void 0 ? c : [];
  }, () => Array.from(i.remoteParticipants.keys())), s = (o, a, c) => n.handleDataStreamPacket(a, c);
  return i.on(_.ConnectionStateChanged, (o) => n.setConnected(o === V.Connected)).on(_.ParticipantDisconnected, (o) => n.validateParticipantHasNoActiveDataStreams(o.identity)), {
    incoming: n,
    outgoing: r,
    // The preconnect audio buffer is sent as a byte stream from inside the core publish path.
    byteStreamOpener: (o) => r.streamBytes(o),
    dataPackets: {
      streamHeader: s,
      streamChunk: s,
      streamTrailer: s
    },
    onEngineCreated: (o) => r.setupEngine(o),
    onDisconnect: () => n.clearControllers(),
    room: {
      registerTextStreamHandler: (o, a) => n.registerTextStreamHandler(o, a),
      unregisterTextStreamHandler: (o) => n.unregisterTextStreamHandler(o),
      registerByteStreamHandler: (o, a) => n.registerByteStreamHandler(o, a),
      unregisterByteStreamHandler: (o) => n.unregisterByteStreamHandler(o)
    },
    localParticipant: {
      sendText: (o, a) => r.sendText(o, a),
      streamText: (o) => r.streamText(o),
      sendFile: (o, a) => r.sendFile(o, a),
      sendBytes: (o, a) => r.sendBytes(o, a),
      streamBytes: (o) => r.streamBytes(o)
    }
  };
}), Hl = {
  deviceId: {
    ideal: "default"
  },
  resolution: zn.h720.resolution
}, Fg = {
  simulcast: !0,
  screenShareEncoding: Us.h1080fps15.encoding,
  videoCodec: ws,
  backupCodec: !0
}, Bg = {
  defaults: Hl,
  createTrack: (i, e, t, n) => new xl(i, e, t, n)
};
function wa() {
  Hm(Bg);
}
function jg(i) {
  return m(this, void 0, void 0, function* () {
    return wa(), (yield Cn({
      audio: !1,
      video: !0
    }))[0];
  });
}
function qg(i, e) {
  const t = i.localParticipant, n = i.options;
  return {
    prepare(r, s, o) {
      return m(this, void 0, void 0, function* () {
        var a, c, d, l;
        !Qf() && i.hasE2EESetup && (e.info("End-to-end encryption is set up, simulcast publishing will be disabled on Safari versions and iOS browsers running iOS < v17.2"), s.simulcast = !1), r.source === C.Source.ScreenShare && Qt() && (s.simulcast = !1), s.videoCodec === "av1" && !jf() && (s.videoCodec = void 0), s.videoCodec === "vp9" && !qf() && (s.videoCodec = void 0), s.videoCodec === void 0 && (s.videoCodec = ws), t.enabledPublishVideoCodecs.length > 0 && (t.enabledPublishVideoCodecs.some((y) => s.videoCodec === Un(y.mime)) || (s.videoCodec = Un(t.enabledPublishVideoCodecs[0].mime)));
        const u = s.videoCodec;
        let h;
        try {
          h = yield r.waitForDimensions();
        } catch {
          const k = (c = (a = n.videoCaptureDefaults) === null || a === void 0 ? void 0 : a.resolution) !== null && c !== void 0 ? c : zn.h720.resolution;
          h = {
            width: k.width,
            height: k.height
          }, e.error("could not determine track dimensions, using defaults", Object.assign(Object.assign({}, B(r)), {
            dims: h
          }));
        }
        o.width = h.width, o.height = h.height, un(u, s) && (nl() || !Hf((d = i.engine) === null || d === void 0 ? void 0 : d.serverVersion)) && (s.simulcast = !1, e.info("SVC simulcast is not supported, disabling simulcast.", B(r)));
        const f = un(u, s);
        Lt(u) && !f && (r.source === C.Source.ScreenShare && (s.scalabilityMode = "L1T3", "contentHint" in r.mediaStreamTrack && (r.mediaStreamTrack.contentHint = "motion", e.debug("forcing contentHint to motion for screenshare with SVC codecs", B(r)))), s.scalabilityMode = (l = s.scalabilityMode) !== null && l !== void 0 ? l : "L3T3_KEY");
        const g = new ss({
          codec: u,
          cid: r.mediaStreamTrack.id
        });
        f && (g.videoLayerMode = Ws.ONE_SPATIAL_LAYER_PER_STREAM), o.simulcastCodecs = [g], s.backupCodec === !0 && (s.backupCodec = {
          codec: ws
        }), s.backupCodec && u !== s.backupCodec.codec && // TODO remove this once e2ee is supported for backup codecs
        o.encryption === H.NONE && (n.dynacast || (n.dynacast = !0), o.simulcastCodecs.push(new ss({
          codec: s.backupCodec.codec,
          cid: ""
        })));
        const p = qi(r.source === C.Source.ScreenShare, o.width, o.height, s);
        return o.layers = Ol(o.width, o.height, p, Lt(s.videoCodec) && !un(s.videoCodec, s)), p;
      });
    },
    senderCreated(r, s, o, a) {
      var c, d;
      if ((c = s.degradationPreference) !== null && c !== void 0 || (s.degradationPreference = bg(r)), r.setDegradationPreference(s.degradationPreference), o && r.codec && ol(r.codec)) {
        const l = mg(r.codec, s, o);
        l > 0 && ((d = i.engine.pcManager) === null || d === void 0 || d.publisher.setTrackCodecBitrate({
          cid: a.cid,
          codec: r.codec,
          maxbr: l / 1e3,
          isScreenShare: r.source === C.Source.ScreenShare
        }));
      }
    },
    serverCodecChanged(r, s, o, a) {
      let c;
      if (o.codecs.forEach((l) => {
        c === void 0 && (c = l.mimeType);
      }), !c)
        return;
      const d = Un(c);
      if (d !== s.videoCodec)
        return e.debug("falling back to server selected codec", Object.assign(Object.assign({}, B(r)), {
          codec: d
        })), s.videoCodec = d, qi(r.source === C.Source.ScreenShare, a.width, a.height, s);
    },
    createScreenTracks: (r) => zl(i, r)
  };
}
function zl(i, e) {
  return m(this, void 0, void 0, function* () {
    const t = i.localParticipant;
    if (e === void 0 && (e = {}), navigator.mediaDevices.getDisplayMedia === void 0)
      throw new sa("getDisplayMedia not supported");
    e.resolution === void 0 && !Jf() && (e.resolution = Us.h1080fps30.resolution);
    const n = xf(e), r = yield navigator.mediaDevices.getDisplayMedia(n), s = r.getVideoTracks();
    if (s.length === 0)
      throw new st("no video track found");
    const o = new xl(s[0], void 0, !1, t.trackLoggerOptions);
    o.source = C.Source.ScreenShare, e.contentHint && (o.mediaStreamTrack.contentHint = e.contentHint);
    const a = [o];
    if (r.getAudioTracks().length > 0) {
      t.emit(x.AudioStreamAcquired);
      const c = new sr(r.getAudioTracks()[0], void 0, !1, t.audioContext, t.trackLoggerOptions);
      c.source = C.Source.ScreenShareAudio, a.push(c);
    }
    return a;
  });
}
function Vg(i) {
  return m(this, void 0, void 0, function* () {
    const e = i.localParticipant;
    if (!(e.pendingPublishing.has(C.Source.Camera) || e.pendingPublishing.has(C.Source.Microphone))) {
      e.pendingPublishing.add(C.Source.Camera), e.pendingPublishing.add(C.Source.Microphone);
      try {
        const t = yield e.createTracks({
          audio: !0,
          video: !0
        });
        yield Promise.all(t.map((n) => e.publishTrack(n)));
      } finally {
        e.pendingPublishing.delete(C.Source.Camera), e.pendingPublishing.delete(C.Source.Microphone);
      }
    }
  });
}
function Kl(i, e, t, n, r) {
  return m(this, void 0, void 0, function* () {
    var s;
    const o = i.localParticipant;
    if (o.isE2EEEnabled)
      return;
    let a;
    if (o.trackPublications.forEach((S) => {
      S.track && S.track === t && (a = S);
    }), !a)
      throw new st("track is not published");
    if (!Fe(t))
      throw new st("track is not a video track");
    const c = Object.assign(Object.assign({}, (s = i.options) === null || s === void 0 ? void 0 : s.publishDefaults), r), d = Il(t, n, c);
    if (!d) {
      e.info("backup codec has been disabled, ignoring request to add additional codec for track", B(t));
      return;
    }
    const l = t.addSimulcastTrack(n, d);
    if (!l)
      return;
    const u = o.normalizeRequestedFrameMetadataOptions(t, c), h = t.mediaStreamTrack.getSettings(), f = h.width, g = h.height, p = f && g ? {
      width: f,
      height: g
    } : void 0;
    p || e.warn("could not determine track dimensions, publishing backup codec without layers", B(t));
    const y = p ? Ol(p.width, p.height, d) : [], k = new si({
      cid: l.mediaStreamTrack.id,
      type: C.kindToProto(t.kind),
      muted: t.isMuted,
      source: C.sourceToProto(t.source),
      sid: t.sid,
      width: p?.width,
      height: p?.height,
      packetTrailerFeatures: u,
      layers: y,
      simulcastCodecs: [{
        codec: c.videoCodec,
        cid: l.mediaStreamTrack.id,
        layers: y
      }]
    }), w = i.engine;
    if (!w || w.isClosed)
      throw new $("cannot publish track when not connected");
    const A = () => m(this, void 0, void 0, function* () {
      yield w.createSimulcastSender(t, l, c, d), yield w.negotiate();
    }), T = (yield Promise.all([w.addTrack(k), A()]))[0];
    e.debug("published ".concat(n, " for track ").concat(t.sid), {
      encodings: d,
      trackInfo: T
    });
  });
}
function Wg(i, e, t) {
  return m(this, void 0, void 0, function* () {
    var n, r, s, o, a;
    if (!(!((a = i.options) === null || a === void 0) && a.dynacast))
      return;
    const c = i.localParticipant.videoTrackPublications.get(t.trackSid);
    if (!c) {
      e.warn("received subscribed quality update for unknown track", {
        trackSid: t.trackSid
      });
      return;
    }
    if (!c.videoTrack)
      return;
    const d = yield c.videoTrack.setPublishingCodecs(t.subscribedCodecs);
    try {
      for (var l = !0, u = je(d), h; h = yield u.next(), n = h.done, !n; l = !0) {
        o = h.value, l = !1;
        const f = o;
        Yc(f) && (e.debug("publish ".concat(f, " for ").concat(c.videoTrack.sid), B(c)), yield Kl(i, e, c.videoTrack, f, c.options));
      }
    } catch (f) {
      r = {
        error: f
      };
    } finally {
      try {
        !l && !n && (s = u.return) && (yield s.call(u));
      } finally {
        if (r) throw r.error;
      }
    }
  });
}
const Gl = {
  key: /* @__PURE__ */ Symbol("lk.extension.video"),
  install(i, e) {
    wa(), i.options.videoCaptureDefaults = Object.assign(Object.assign({}, Hl), i.options.videoCaptureDefaults), i.options.publishDefaults = Object.assign(Object.assign({}, Fg), i.options.publishDefaults);
    const t = i.localParticipant;
    return {
      videoPublisher: qg(i, e.log),
      onEngineCreated: (n) => {
        n.on(P.SubscribedQualityUpdate, (r) => Wg(i, e.log, r));
      },
      localParticipant: {
        setCameraEnabled: (n, r, s) => t.setTrackEnabled(C.Source.Camera, n, r, s),
        setScreenShareEnabled: (n, r, s) => t.setTrackEnabled(C.Source.ScreenShare, n, r, s),
        enableCameraAndMicrophone: () => Vg(i),
        createScreenTracks: (n) => zl(i, n),
        publishAdditionalCodecForTrack: (n, r, s) => Kl(i, e.log, n, r, s)
      }
    };
  }
}, Hg = (i) => _g(i, [Hi, Gl]);
var ze;
(function(i) {
  i[i.IDLE = 0] = "IDLE", i[i.RUNNING = 1] = "RUNNING", i[i.SKIPPED = 2] = "SKIPPED", i[i.SUCCESS = 3] = "SUCCESS", i[i.FAILED = 4] = "FAILED";
})(ze || (ze = {}));
class Dt extends xe.EventEmitter {
  constructor(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    super(), this.status = ze.IDLE, this.logs = [], this.options = {}, this.url = e, this.token = t, this.name = this.constructor.name, this.room = Hg(n.roomOptions), this.connectOptions = n.connectOptions, this.options = n;
  }
  run(e) {
    return m(this, void 0, void 0, function* () {
      if (this.status !== ze.IDLE)
        throw Error("check is running already");
      this.setStatus(ze.RUNNING);
      try {
        yield this.perform();
      } catch (t) {
        t instanceof Error && (this.options.errorsAsWarnings ? this.appendWarning(t.message) : this.appendError(t.message));
      }
      return yield this.disconnect(), yield new Promise((t) => setTimeout(t, 500)), this.status !== ze.SKIPPED && this.setStatus(this.isSuccess() ? ze.SUCCESS : ze.FAILED), e && e(), this.getInfo();
    });
  }
  isSuccess() {
    return !this.logs.some((e) => e.level === "error");
  }
  connect(e) {
    return m(this, void 0, void 0, function* () {
      return this.room.state === V.Connected ? this.room : (e || (e = this.url), yield this.room.connect(e, this.token, this.connectOptions), this.room);
    });
  }
  disconnect() {
    return m(this, void 0, void 0, function* () {
      this.room && this.room.state !== V.Disconnected && (yield this.room.disconnect(), yield new Promise((e) => setTimeout(e, 500)));
    });
  }
  skip() {
    this.setStatus(ze.SKIPPED);
  }
  switchProtocol(e) {
    return m(this, void 0, void 0, function* () {
      let t = !1, n = !1;
      if (this.room.on(_.Reconnecting, () => {
        t = !0;
      }), this.room.once(_.Reconnected, () => {
        n = !0;
      }), this.room.simulateScenario("force-".concat(e)), yield new Promise((s) => setTimeout(s, 1e3)), !t)
        return;
      const r = Date.now() + 1e4;
      for (; Date.now() < r; ) {
        if (n)
          return;
        yield be(100);
      }
      throw new Error("Could not reconnect using ".concat(e, " protocol after 10 seconds"));
    });
  }
  appendMessage(e) {
    this.logs.push({
      level: "info",
      message: e
    }), this.emit("update", this.getInfo());
  }
  appendWarning(e) {
    this.logs.push({
      level: "warning",
      message: e
    }), this.emit("update", this.getInfo());
  }
  appendError(e) {
    this.logs.push({
      level: "error",
      message: e
    }), this.emit("update", this.getInfo());
  }
  setStatus(e) {
    this.status = e, this.emit("update", this.getInfo());
  }
  get engine() {
    var e;
    return (e = this.room) === null || e === void 0 ? void 0 : e.engine;
  }
  getInfo() {
    return {
      logs: this.logs,
      name: this.name,
      status: this.status,
      description: this.description
    };
  }
}
class zg extends Dt {
  get description() {
    return "Cloud regions";
  }
  perform() {
    return m(this, void 0, void 0, function* () {
      const e = new W(this.url, this.token);
      if (!e.isCloud()) {
        this.skip();
        return;
      }
      const t = [], n = /* @__PURE__ */ new Set();
      for (let s = 0; s < 3; s++) {
        const o = yield e.getNextBestRegionUrl();
        if (!o)
          break;
        if (n.has(o))
          continue;
        n.add(o);
        const a = yield this.checkCloudRegion(o);
        this.appendMessage("".concat(a.region, " RTT: ").concat(a.rtt, "ms, duration: ").concat(a.duration, "ms")), t.push(a);
      }
      t.sort((s, o) => (s.duration - o.duration) * 0.5 + (s.rtt - o.rtt) * 0.5);
      const r = t[0];
      this.bestStats = r, this.appendMessage("best Cloud region: ".concat(r.region));
    });
  }
  getInfo() {
    const e = super.getInfo();
    return e.data = this.bestStats, e;
  }
  checkCloudRegion(e) {
    return m(this, void 0, void 0, function* () {
      var t, n;
      yield this.connect(e), this.options.protocol === "tcp" && (yield this.switchProtocol("tcp"));
      const r = (t = this.room.serverInfo) === null || t === void 0 ? void 0 : t.region;
      if (!r)
        throw new Error("Region not found");
      const s = yield this.room.localParticipant.streamText({
        topic: "test"
      }), o = 1e3, c = 1e6 / o, d = "A".repeat(o), l = Date.now();
      for (let g = 0; g < c; g++)
        yield s.write(d);
      yield s.close();
      const u = Date.now(), h = yield (n = this.room.engine.pcManager) === null || n === void 0 ? void 0 : n.publisher.getStats(), f = {
        region: r,
        rtt: 1e4,
        duration: u - l
      };
      return h?.forEach((g) => {
        g.type === "candidate-pair" && g.nominated && (f.rtt = g.currentRoundTripTime * 1e3);
      }), yield this.disconnect(), f;
    });
  }
}
const Wr = 1e4;
class Kg extends Dt {
  get description() {
    return "Connection via UDP vs TCP";
  }
  perform() {
    return m(this, void 0, void 0, function* () {
      const e = yield this.checkConnectionProtocol("udp"), t = yield this.checkConnectionProtocol("tcp");
      this.bestStats = e, e.qualityLimitationDurations.bandwidth - t.qualityLimitationDurations.bandwidth > 0.5 || (e.packetsLost - t.packetsLost) / e.packetsSent > 0.01 ? (this.appendMessage("best connection quality via tcp"), this.bestStats = t) : this.appendMessage("best connection quality via udp");
      const n = this.bestStats;
      this.appendMessage("upstream bitrate: ".concat((n.bitrateTotal / n.count / 1e3 / 1e3).toFixed(2), " mbps")), this.appendMessage("RTT: ".concat((n.rttTotal / n.count * 1e3).toFixed(2), " ms")), this.appendMessage("jitter: ".concat((n.jitterTotal / n.count * 1e3).toFixed(2), " ms")), n.packetsLost > 0 && this.appendWarning("packets lost: ".concat((n.packetsLost / n.packetsSent * 100).toFixed(2), "%")), n.qualityLimitationDurations.bandwidth > 1 && this.appendWarning("bandwidth limited ".concat((n.qualityLimitationDurations.bandwidth / (Wr / 1e3) * 100).toFixed(2), "%")), n.qualityLimitationDurations.cpu > 0 && this.appendWarning("cpu limited ".concat((n.qualityLimitationDurations.cpu / (Wr / 1e3) * 100).toFixed(2), "%"));
    });
  }
  getInfo() {
    const e = super.getInfo();
    return e.data = this.bestStats, e;
  }
  checkConnectionProtocol(e) {
    return m(this, void 0, void 0, function* () {
      yield this.connect(), e === "tcp" ? yield this.switchProtocol("tcp") : yield this.switchProtocol("udp");
      const t = document.createElement("canvas");
      t.width = 1280, t.height = 720;
      const n = t.getContext("2d");
      if (!n)
        throw new Error("Could not get canvas context");
      let r = 0;
      const s = () => {
        r = (r + 1) % 360, n.fillStyle = "hsl(".concat(r, ", 100%, 50%)"), n.fillRect(0, 0, t.width, t.height), requestAnimationFrame(s);
      };
      s();
      const a = t.captureStream(30).getVideoTracks()[0], d = (yield this.room.localParticipant.publishTrack(a, {
        simulcast: !1,
        degradationPreference: "maintain-resolution",
        videoEncoding: {
          maxBitrate: 2e6
        }
      })).track, l = {
        protocol: e,
        packetsLost: 0,
        packetsSent: 0,
        qualityLimitationDurations: {},
        rttTotal: 0,
        jitterTotal: 0,
        bitrateTotal: 0,
        count: 0
      }, u = setInterval(() => m(this, void 0, void 0, function* () {
        const h = yield d.getRTCStatsReport();
        h?.forEach((f) => {
          f.type === "outbound-rtp" ? (l.packetsSent = f.packetsSent, l.qualityLimitationDurations = f.qualityLimitationDurations, l.bitrateTotal += f.targetBitrate, l.count++) : f.type === "remote-inbound-rtp" && (l.packetsLost = f.packetsLost, l.rttTotal += f.roundTripTime, l.jitterTotal += f.jitter);
        });
      }), 1e3);
      return yield new Promise((h) => setTimeout(h, Wr)), clearInterval(u), a.stop(), t.remove(), yield this.disconnect(), l;
    });
  }
}
class Gg extends Dt {
  get description() {
    return "Can publish audio";
  }
  perform() {
    return m(this, void 0, void 0, function* () {
      var e;
      const t = yield this.connect(), n = yield zm();
      if (yield Xd(n, 1e3))
        throw new Error("unable to detect audio from microphone");
      this.appendMessage("detected audio from microphone"), t.localParticipant.publishTrack(n), yield new Promise((a) => setTimeout(a, 3e3));
      const s = yield (e = n.sender) === null || e === void 0 ? void 0 : e.getStats();
      if (!s)
        throw new Error("Could not get RTCStats");
      let o = 0;
      if (s.forEach((a) => {
        a.type === "outbound-rtp" && (a.kind === "audio" || !a.kind && a.mediaType === "audio") && (o = a.packetsSent);
      }), o === 0)
        throw new Error("Could not determine packets are sent");
      this.appendMessage("published ".concat(o, " audio packets"));
    });
  }
}
class Jg extends Dt {
  get description() {
    return "Can publish video";
  }
  perform() {
    return m(this, void 0, void 0, function* () {
      var e;
      const t = yield this.connect(), n = yield jg();
      yield this.checkForVideo(n.mediaStreamTrack), t.localParticipant.publishTrack(n), yield new Promise((o) => setTimeout(o, 5e3));
      const r = yield (e = n.sender) === null || e === void 0 ? void 0 : e.getStats();
      if (!r)
        throw new Error("Could not get RTCStats");
      let s = 0;
      if (r.forEach((o) => {
        o.type === "outbound-rtp" && (o.kind === "video" || !o.kind && o.mediaType === "video") && (s += o.packetsSent);
      }), s === 0)
        throw new Error("Could not determine packets are sent");
      this.appendMessage("published ".concat(s, " video packets"));
    });
  }
  checkForVideo(e) {
    return m(this, void 0, void 0, function* () {
      const t = new MediaStream();
      t.addTrack(e.clone());
      const n = document.createElement("video");
      n.srcObject = t, n.muted = !0, n.autoplay = !0, n.playsInline = !0, n.setAttribute("playsinline", "true"), document.body.appendChild(n), yield new Promise((r) => {
        n.onplay = () => {
          setTimeout(() => {
            var s, o, a, c;
            const d = document.createElement("canvas"), l = e.getSettings(), u = (o = (s = l.width) !== null && s !== void 0 ? s : n.videoWidth) !== null && o !== void 0 ? o : 1280, h = (c = (a = l.height) !== null && a !== void 0 ? a : n.videoHeight) !== null && c !== void 0 ? c : 720;
            d.width = u, d.height = h;
            const f = d.getContext("2d");
            f.drawImage(n, 0, 0);
            const p = f.getImageData(0, 0, d.width, d.height).data;
            let y = !0;
            for (let k = 0; k < p.length; k += 4)
              if (p[k] !== 0 || p[k + 1] !== 0 || p[k + 2] !== 0) {
                y = !1;
                break;
              }
            y ? this.appendError("camera appears to be producing only black frames") : this.appendMessage("received video frames"), r();
          }, 1e3);
        }, n.play();
      }), t.getTracks().forEach((r) => r.stop()), n.remove();
    });
  }
}
class $g extends Dt {
  get description() {
    return "Resuming connection after interruption";
  }
  perform() {
    return m(this, void 0, void 0, function* () {
      var e;
      const t = yield this.connect();
      let n = !1, r = !1, s;
      const o = new Promise((d) => {
        setTimeout(d, 5e3), s = d;
      }), a = () => {
        n = !0;
      };
      t.on(_.SignalReconnecting, a).on(_.Reconnecting, a).on(_.Reconnected, () => {
        r = !0, s(!0);
      }), (e = t.engine.client.ws) === null || e === void 0 || e.close();
      const c = t.engine.client.onClose;
      if (c && c(""), yield o, n) {
        if (!r || t.state !== V.Connected)
          throw this.appendWarning("reconnection is only possible in Redis-based configurations"), new Error("Not able to reconnect");
      } else throw new Error("Did not attempt to reconnect");
    });
  }
}
class Qg extends Dt {
  get description() {
    return "Can connect via TURN";
  }
  perform() {
    return m(this, void 0, void 0, function* () {
      var e, t, n;
      Sn(new URL(this.url)) && (this.appendMessage("Using region specific url"), this.url = (e = yield new W(this.url, this.token).getNextBestRegionUrl()) !== null && e !== void 0 ? e : this.url);
      const r = new ua(), s = yield r.join(this.url, this.token, {
        autoSubscribe: !0,
        maxRetries: 0,
        e2eeEnabled: !1,
        websocketTimeout: 15e3
      }, void 0, !0);
      let o = !1, a = !1, c = !1;
      for (let d of s.iceServers)
        for (let l of d.urls)
          l.startsWith("turn:") ? (a = !0, c = !0) : l.startsWith("turns:") && (a = !0, c = !0, o = !0), l.startsWith("stun:") && (c = !0);
      c ? a && !o && this.appendWarning("TURN is configured server side, but TURN/TLS is unavailable.") : this.appendWarning("No STUN servers configured on server side."), yield r.close(), !((n = (t = this.connectOptions) === null || t === void 0 ? void 0 : t.rtcConfig) === null || n === void 0) && n.iceServers || a ? yield this.room.connect(this.url, this.token, {
        rtcConfig: {
          iceTransportPolicy: "relay"
        }
      }) : (this.appendWarning("No TURN servers configured."), this.skip(), yield new Promise((d) => setTimeout(d, 0)));
    });
  }
}
class Yg extends Dt {
  get description() {
    return "Establishing WebRTC connection";
  }
  perform() {
    return m(this, void 0, void 0, function* () {
      let e = !1, t = !1;
      this.room.on(_.SignalConnected, () => {
        var n;
        const r = this.room.engine.client.onTrickle;
        this.room.engine.client.onTrickle = (s, o) => {
          if (s.candidate) {
            const a = new RTCIceCandidate(s);
            let c = "".concat(a.protocol, " ").concat(a.address, ":").concat(a.port, " ").concat(a.type);
            a.address && (Xg(a.address) ? c += " (private)" : a.protocol === "tcp" && a.tcpType === "passive" ? (e = !0, c += " (passive)") : a.protocol === "udp" && (t = !0)), this.appendMessage(c);
          }
          r && r(s, o);
        }, !((n = this.room.engine.pcManager) === null || n === void 0) && n.subscriber && (this.room.engine.pcManager.subscriber.onIceCandidateError = (s) => {
          s instanceof RTCPeerConnectionIceErrorEvent && this.appendWarning("error with ICE candidate: ".concat(s.errorCode, " ").concat(s.errorText, " ").concat(s.url));
        });
      });
      try {
        yield this.connect(), q.info("now the room is connected");
      } catch (n) {
        throw this.appendWarning("ports need to be open on firewall in order to connect."), n;
      }
      e || this.appendWarning("Server is not configured for ICE/TCP"), t || this.appendWarning("No public IPv4 UDP candidates were found. Your server is likely not configured correctly");
    });
  }
}
function Xg(i) {
  const e = i.split(".");
  if (e.length === 4) {
    if (e[0] === "10")
      return !0;
    if (e[0] === "192" && e[1] === "168")
      return !0;
    if (e[0] === "172") {
      const t = parseInt(e[1], 10);
      if (t >= 16 && t <= 31)
        return !0;
    }
  }
  return !1;
}
class Zg extends Dt {
  get description() {
    return "Connecting to signal connection via WebSocket";
  }
  perform() {
    return m(this, void 0, void 0, function* () {
      var e, t, n;
      (this.url.startsWith("ws:") || this.url.startsWith("http:")) && this.appendWarning("Server is insecure, clients may block connections to it");
      let r = new ua(), s;
      try {
        s = yield r.join(this.url, this.token, {
          autoSubscribe: !0,
          maxRetries: 0,
          e2eeEnabled: !1,
          websocketTimeout: 15e3
        }, void 0, !0);
      } catch (o) {
        if (Sn(new URL(this.url))) {
          this.appendMessage("Initial connection failed with error ".concat(o.message, ". Retrying with region fallback"));
          const c = yield new W(this.url, this.token).getNextBestRegionUrl();
          c && (s = yield r.join(c, this.token, {
            autoSubscribe: !0,
            maxRetries: 0,
            e2eeEnabled: !1,
            websocketTimeout: 15e3
          }, void 0, !0), this.appendMessage("Fallback to region worked. To avoid initial connections failing, ensure you're calling room.prepareConnection() ahead of time"));
        }
      }
      s ? (this.appendMessage("Connected to server, version ".concat(s.serverVersion, ".")), ((e = s.serverInfo) === null || e === void 0 ? void 0 : e.edition) === Id.Cloud && (!((t = s.serverInfo) === null || t === void 0) && t.region) && this.appendMessage("LiveKit Cloud: ".concat((n = s.serverInfo) === null || n === void 0 ? void 0 : n.region))) : this.appendError("Websocket connection could not be established"), yield r.close();
    });
  }
}
class Fv extends xe.EventEmitter {
  constructor(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    super(), this.options = {}, this.checkResults = /* @__PURE__ */ new Map(), this.url = e, this.token = t, this.options = n;
  }
  getNextCheckId() {
    const e = this.checkResults.size;
    return this.checkResults.set(e, {
      logs: [],
      status: ze.IDLE,
      name: "",
      description: ""
    }), e;
  }
  updateCheck(e, t) {
    this.checkResults.set(e, t), this.emit("checkUpdate", e, t);
  }
  isSuccess() {
    return Array.from(this.checkResults.values()).every((e) => e.status !== ze.FAILED);
  }
  getResults() {
    return Array.from(this.checkResults.values());
  }
  createAndRunCheck(e) {
    return m(this, void 0, void 0, function* () {
      const t = this.getNextCheckId(), n = new e(this.url, this.token, this.options), r = (o) => {
        this.updateCheck(t, o);
      };
      n.on("update", r);
      const s = yield n.run();
      return n.off("update", r), s;
    });
  }
  checkWebsocket() {
    return m(this, void 0, void 0, function* () {
      return this.createAndRunCheck(Zg);
    });
  }
  checkWebRTC() {
    return m(this, void 0, void 0, function* () {
      return this.createAndRunCheck(Yg);
    });
  }
  checkTURN() {
    return m(this, void 0, void 0, function* () {
      return this.createAndRunCheck(Qg);
    });
  }
  checkReconnect() {
    return m(this, void 0, void 0, function* () {
      return this.createAndRunCheck($g);
    });
  }
  checkPublishAudio() {
    return m(this, void 0, void 0, function* () {
      return this.createAndRunCheck(Gg);
    });
  }
  checkPublishVideo() {
    return m(this, void 0, void 0, function* () {
      return this.createAndRunCheck(Jg);
    });
  }
  checkConnectionProtocol() {
    return m(this, void 0, void 0, function* () {
      const e = yield this.createAndRunCheck(Kg);
      if (e.data && "protocol" in e.data) {
        const t = e.data;
        this.options.protocol = t.protocol;
      }
      return e;
    });
  }
  checkCloudRegion() {
    return m(this, void 0, void 0, function* () {
      return this.createAndRunCheck(zg);
    });
  }
}
var xt;
(function(i) {
  i.SetKey = "setKey", i.RatchetRequest = "ratchetRequest", i.KeyRatcheted = "keyRatcheted";
})(xt || (xt = {}));
var cc;
(function(i) {
  i.KeyRatcheted = "keyRatcheted";
})(cc || (cc = {}));
var rt;
(function(i) {
  i.ParticipantEncryptionStatusChanged = "participantEncryptionStatusChanged", i.EncryptionError = "encryptionError";
})(rt || (rt = {}));
var dc;
(function(i) {
  i.Error = "cryptorError";
})(dc || (dc = {}));
class Bv extends xe.EventEmitter {
  constructor() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    super(), this.latestManuallySetKeyIndex = 0, this.onKeyRatcheted = (t, n, r) => {
      q.debug("key ratcheted event received", {
        participantId: n,
        keyIndex: r
      });
    }, this.keyInfoMap = /* @__PURE__ */ new Map(), this.options = Object.assign(Object.assign({}, kp), e), this.on(xt.KeyRatcheted, this.onKeyRatcheted);
  }
  /**
   * callback to invoke once a key has been set for a participant
   * @param key
   * @param participantIdentity
   * @param keyIndex
   */
  onSetEncryptionKey(e, t, n) {
    const r = {
      key: e,
      participantIdentity: t,
      keyIndex: n
    };
    if (!this.options.sharedKey && !t)
      throw new Error("participant identity needs to be passed for encryption key if sharedKey option is false");
    this.keyInfoMap.set("".concat(t ?? "shared", "-").concat(n ?? 0), r), n !== void 0 && (this.latestManuallySetKeyIndex = n), this.emit(xt.SetKey, r, n !== void 0);
  }
  getKeys() {
    return Array.from(this.keyInfoMap.values());
  }
  getLatestManuallySetKeyIndex() {
    return this.latestManuallySetKeyIndex;
  }
  getOptions() {
    return this.options;
  }
  ratchetKey(e, t) {
    this.emit(xt.RatchetRequest, e, t);
  }
}
var zi;
(function(i) {
  i[i.InvalidKey = 0] = "InvalidKey", i[i.MissingKey = 1] = "MissingKey", i[i.InternalError = 2] = "InternalError";
})(zi || (zi = {}));
class ev extends ot {
  constructor(e) {
    let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : zi.InternalError, n = arguments.length > 2 ? arguments[2] : void 0;
    super(40, e), this.reason = t, this.participantIdentity = n;
  }
}
new TextEncoder();
new TextDecoder();
new TextDecoder("utf-8", {
  fatal: !0
});
class Pe extends Error {
  constructor(e, t) {
    var n;
    super(e, t), D(this, "code", "ERR_JOSE_GENERIC"), this.name = this.constructor.name, (n = Error.captureStackTrace) === null || n === void 0 || n.call(Error, this, this.constructor);
  }
}
D(Pe, "code", "ERR_JOSE_GENERIC");
class tv extends Pe {
  constructor(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "unspecified", r = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "unspecified";
    super(e, {
      cause: {
        claim: n,
        reason: r,
        payload: t
      }
    }), D(this, "code", "ERR_JWT_CLAIM_VALIDATION_FAILED"), D(this, "claim", void 0), D(this, "reason", void 0), D(this, "payload", void 0), this.claim = n, this.reason = r, this.payload = t;
  }
}
D(tv, "code", "ERR_JWT_CLAIM_VALIDATION_FAILED");
class nv extends Pe {
  constructor(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "unspecified", r = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "unspecified";
    super(e, {
      cause: {
        claim: n,
        reason: r,
        payload: t
      }
    }), D(this, "code", "ERR_JWT_EXPIRED"), D(this, "claim", void 0), D(this, "reason", void 0), D(this, "payload", void 0), this.claim = n, this.reason = r, this.payload = t;
  }
}
D(nv, "code", "ERR_JWT_EXPIRED");
class iv extends Pe {
  constructor() {
    super(...arguments), D(this, "code", "ERR_JOSE_ALG_NOT_ALLOWED");
  }
}
D(iv, "code", "ERR_JOSE_ALG_NOT_ALLOWED");
class rv extends Pe {
  constructor() {
    super(...arguments), D(this, "code", "ERR_JOSE_NOT_SUPPORTED");
  }
}
D(rv, "code", "ERR_JOSE_NOT_SUPPORTED");
class sv extends Pe {
  constructor() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "decryption operation failed", t = arguments.length > 1 ? arguments[1] : void 0;
    super(e, t), D(this, "code", "ERR_JWE_DECRYPTION_FAILED");
  }
}
D(sv, "code", "ERR_JWE_DECRYPTION_FAILED");
class av extends Pe {
  constructor() {
    super(...arguments), D(this, "code", "ERR_JWE_INVALID");
  }
}
D(av, "code", "ERR_JWE_INVALID");
class ov extends Pe {
  constructor() {
    super(...arguments), D(this, "code", "ERR_JWS_INVALID");
  }
}
D(ov, "code", "ERR_JWS_INVALID");
class cv extends Pe {
  constructor() {
    super(...arguments), D(this, "code", "ERR_JWT_INVALID");
  }
}
D(cv, "code", "ERR_JWT_INVALID");
class dv extends Pe {
  constructor() {
    super(...arguments), D(this, "code", "ERR_JWK_INVALID");
  }
}
D(dv, "code", "ERR_JWK_INVALID");
class lv extends Pe {
  constructor() {
    super(...arguments), D(this, "code", "ERR_JWKS_INVALID");
  }
}
D(lv, "code", "ERR_JWKS_INVALID");
class uv extends Pe {
  constructor() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "no applicable key found in the JSON Web Key Set", t = arguments.length > 1 ? arguments[1] : void 0;
    super(e, t), D(this, "code", "ERR_JWKS_NO_MATCHING_KEY");
  }
}
D(uv, "code", "ERR_JWKS_NO_MATCHING_KEY");
class hv extends Pe {
  constructor() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "multiple matching keys found in the JSON Web Key Set", t = arguments.length > 1 ? arguments[1] : void 0;
    super(e, t), D(this, Symbol.asyncIterator, Nu(function* () {
    })), D(this, "code", "ERR_JWKS_MULTIPLE_MATCHING_KEYS");
  }
}
D(hv, "code", "ERR_JWKS_MULTIPLE_MATCHING_KEYS");
class fv extends Pe {
  constructor() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "request timed out", t = arguments.length > 1 ? arguments[1] : void 0;
    super(e, t), D(this, "code", "ERR_JWKS_TIMEOUT");
  }
}
D(fv, "code", "ERR_JWKS_TIMEOUT");
class pv extends Pe {
  constructor() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "signature verification failed", t = arguments.length > 1 ? arguments[1] : void 0;
    super(e, t), D(this, "code", "ERR_JWS_SIGNATURE_VERIFICATION_FAILED");
  }
}
D(pv, "code", "ERR_JWS_SIGNATURE_VERIFICATION_FAILED");
class Ht extends xe.EventEmitter {
  get logContext() {
    var e, t;
    return {
      room: (e = this.room) === null || e === void 0 ? void 0 : e.name,
      participant: (t = this.room) === null || t === void 0 ? void 0 : t.localParticipant.identity
    };
  }
  constructor(e, t) {
    super(), this.decryptDataRequests = /* @__PURE__ */ new Map(), this.encryptDataRequests = /* @__PURE__ */ new Map(), this.log = pe(ne.E2EE, () => this.logContext), this.onWorkerMessage = (n) => {
      var r;
      const s = n.data, o = s.kind, a = s.data;
      switch (o) {
        case "error":
          if (a.uuid) {
            const l = this.decryptDataRequests.get(a.uuid);
            if (l?.reject) {
              l.reject(a.error);
              break;
            }
            const u = this.encryptDataRequests.get(a.uuid);
            if (u?.reject) {
              u.reject(a.error);
              break;
            }
          }
          this.log.error(a.error.message), this.emit(rt.EncryptionError, a.error, a.participantIdentity);
          break;
        case "initAck":
          a.enabled && this.keyProvider.getKeys().forEach((l) => {
            this.postKey(l, !1);
          });
          break;
        case "enable":
          if (a.enabled && this.keyProvider.getKeys().forEach((l) => {
            this.postKey(l, !1);
          }), a.local)
            this.encryptionEnabled !== a.enabled && (this.emit(rt.ParticipantEncryptionStatusChanged, a.enabled, this.room.localParticipant), this.encryptionEnabled = a.enabled);
          else if (a.participantIdentity) {
            const l = (r = this.room) === null || r === void 0 ? void 0 : r.getParticipantByIdentity(a.participantIdentity);
            if (!l)
              throw TypeError("couldn't set encryption status, participant not found".concat(a.participantIdentity));
            this.emit(rt.ParticipantEncryptionStatusChanged, a.enabled, l);
          }
          break;
        case "ratchetKey":
          this.keyProvider.emit(xt.KeyRatcheted, a.ratchetResult, a.participantIdentity, a.keyIndex);
          break;
        case "decryptDataResponse":
          const c = this.decryptDataRequests.get(a.uuid);
          c?.resolve && c.resolve(a);
          break;
        case "encryptDataResponse":
          const d = this.encryptDataRequests.get(a.uuid);
          d?.resolve && d.resolve(a);
          break;
        case "packetTrailerMetadata":
          this.handleFrameMetadata(a.trackId, a.rtpTimestamp, a.ssrc, a.metadata);
          break;
        case "log":
          Tn[a.level](a.msg, a.context);
          break;
      }
    }, this.onWorkerError = (n) => {
      this.log.error("e2ee worker encountered an error:", {
        error: n.error
      }), this.emit(rt.EncryptionError, n.error, void 0);
    }, this.keyProvider = e.keyProvider, this.worker = e.worker, this.encryptionEnabled = !1, this.dataChannelEncryptionEnabled = t;
  }
  get isEnabled() {
    return this.encryptionEnabled;
  }
  get isDataChannelEncryptionEnabled() {
    return this.isEnabled && this.dataChannelEncryptionEnabled;
  }
  /**
   * @internal
   */
  setup(e) {
    if (!Tp())
      throw new sa("tried to setup end-to-end encryption on an unsupported browser");
    if (this.log.info("setting up e2ee"), e !== this.room) {
      this.room = e, this.setupEventListeners(e, this.keyProvider);
      const t = {
        kind: "init",
        data: {
          keyProviderOptions: this.keyProvider.getOptions(),
          loglevel: Tn.getLevel()
        }
      };
      this.worker && (this.log.info("initializing worker", {
        worker: this.worker
      }), this.worker.onmessage = this.onWorkerMessage, this.worker.onerror = this.onWorkerError, this.worker.postMessage(t), this.subscribeToLogLevelChanges());
    }
  }
  /**
   * Subscribe the current worker to main-thread `workerLogger` level changes,
   * without strongly retaining `this` or `this.worker` from the module-global
   * listener Set on the logger. See {@link disposeRegistry}.
   */
  subscribeToLogLevelChanges() {
    var e;
    (e = this.unsubscribeLogLevel) === null || e === void 0 || e.call(this);
    let t;
    if (Ht.disposeRegistry) {
      const n = new WeakRef(this.worker);
      t = so((r) => {
        const s = n.deref();
        if (!s) {
          t?.();
          return;
        }
        s.postMessage({
          kind: "setLogLevel",
          data: {
            level: r
          }
        });
      }), Ht.disposeRegistry.register(this, t, this);
    } else {
      const n = this.worker;
      t = so((r) => {
        n.postMessage({
          kind: "setLogLevel",
          data: {
            level: r
          }
        });
      });
    }
    this.unsubscribeLogLevel = t;
  }
  /**
   * @internal
   * Release the log-level subscription, reject any pending encrypt/decrypt
   * futures, and detach the worker message handlers. The worker itself is
   * caller-owned and is not terminated. Idempotent.
   */
  dispose() {
    var e, t, n;
    (e = this.unsubscribeLogLevel) === null || e === void 0 || e.call(this), this.unsubscribeLogLevel = void 0, Ht.disposeRegistry && Ht.disposeRegistry.unregister(this);
    const r = new ev("E2EEManager disposed", zi.InternalError);
    for (const s of [...this.encryptDataRequests.values()])
      (t = s.reject) === null || t === void 0 || t.call(s, r);
    for (const s of [...this.decryptDataRequests.values()])
      (n = s.reject) === null || n === void 0 || n.call(s, r);
    this.worker && (this.worker.onmessage = null, this.worker.onerror = null), this.removeAllListeners();
  }
  /**
   * Sets whether the local participant encrypts.
   * @internal
   */
  setLocalParticipantCryptorEnabled(e) {
    var t, n;
    this.log.debug("set e2ee to ".concat(e, " for the local participant")), this.postEnable(e, (n = (t = this.room) === null || t === void 0 ? void 0 : t.localParticipant.identity) !== null && n !== void 0 ? n : "", !0);
  }
  /**
   * @internal
   * @deprecated use `setLocalParticipantCryptorEnabled`. The identity is ignored: this always
   * sets the state of the local participant.
   */
  setParticipantCryptorEnabled(e, t) {
    this.setLocalParticipantCryptorEnabled(e);
  }
  /**
   * @internal
   */
  setSifTrailer(e) {
    !e || e.length === 0 ? this.log.warn("ignoring server sent trailer as it's empty") : this.postSifTrailer(e);
  }
  handleFrameMetadata(e, t, n, r) {
    if (this.room) {
      for (const s of [this.room.localParticipant, ...this.room.remoteParticipants.values()])
        for (const o of s.trackPublications.values())
          if (o.track && o.track.mediaStreamID === e && o.track instanceof ya && o.track.frameMetadataExtractor) {
            o.track.frameMetadataExtractor.storeMetadata(t, n, r);
            return;
          }
    }
  }
  setupEngine(e) {
    e.on(P.RTPVideoMapUpdate, (t) => {
      this.postRTPMap(t);
    });
  }
  setupEventListeners(e, t) {
    e.on(_.TrackPublished, (n, r) => this.setParticipantCryptorEnabledForPublication(n, r.identity)), e.on(_.ConnectionStateChanged, (n) => {
      n === V.Connected && e.remoteParticipants.forEach((r) => {
        r.trackPublications.forEach((s) => {
          this.setParticipantCryptorEnabledForPublication(s, r.identity);
        });
      });
    }).on(_.TrackUnsubscribed, (n, r, s) => {
      var o;
      const a = {
        kind: "removeTransform",
        data: {
          participantIdentity: s.identity,
          trackId: n.mediaStreamID
        }
      };
      (o = this.worker) === null || o === void 0 || o.postMessage(a);
    }).on(_.TrackSubscribed, (n, r, s) => {
      this.setupE2EEReceiver(n, s.identity, r.trackInfo);
    }).on(_.SignalConnected, () => {
      if (!this.room)
        throw new TypeError("expected room to be present on signal connect");
      const n = t.getLatestManuallySetKeyIndex();
      t.getKeys().forEach((r) => {
        var s;
        this.postKey(r, n === ((s = r.keyIndex) !== null && s !== void 0 ? s : 0));
      }), this.setLocalParticipantCryptorEnabled(this.room.localParticipant.isE2EEEnabled);
    }), e.localParticipant.on(x.LocalSenderCreated, (n, r) => m(this, void 0, void 0, function* () {
      this.setupE2EESender(r, n);
    })), e.localParticipant.on(x.LocalTrackPublished, (n) => {
      if (!yt(n.track) || !$n())
        return;
      const r = {
        kind: "updateCodec",
        data: {
          trackId: n.track.mediaStreamID,
          codec: Un(n.trackInfo.codecs[0].mimeType),
          participantIdentity: this.room.localParticipant.identity,
          hasPacketTrailer: !1,
          operation: "encode"
        }
      };
      this.worker.postMessage(r);
    }), t.on(xt.SetKey, (n, r) => this.postKey(n, r ?? !0)).on(xt.RatchetRequest, (n, r) => this.postRatchetRequest(n, r));
  }
  encryptData(e) {
    return m(this, void 0, void 0, function* () {
      if (!this.worker)
        throw Error("could not encrypt data, worker is missing");
      const t = crypto.randomUUID(), n = {
        kind: "encryptDataRequest",
        data: {
          uuid: t,
          payload: e,
          participantIdentity: this.room.localParticipant.identity
        }
      }, r = new ye();
      return r.onFinally = () => {
        this.encryptDataRequests.delete(t);
      }, this.encryptDataRequests.set(t, r), this.worker.postMessage(n), r.promise;
    });
  }
  handleEncryptedData(e, t, n, r) {
    if (!this.worker)
      throw Error("could not handle encrypted data, worker is missing");
    const s = crypto.randomUUID(), o = {
      kind: "decryptDataRequest",
      data: {
        uuid: s,
        payload: e,
        iv: t,
        participantIdentity: n,
        keyIndex: r
      }
    }, a = new ye();
    return a.onFinally = () => {
      this.decryptDataRequests.delete(s);
    }, this.decryptDataRequests.set(s, a), this.worker.postMessage(o), a.promise;
  }
  postRatchetRequest(e, t) {
    if (!this.worker)
      throw Error("could not ratchet key, worker is missing");
    const n = {
      kind: "ratchetRequest",
      data: {
        participantIdentity: e,
        keyIndex: t
      }
    };
    this.worker.postMessage(n);
  }
  postKey(e, t) {
    let n = e.key, r = e.participantIdentity, s = e.keyIndex;
    var o;
    if (!this.worker)
      throw Error("could not set key, worker is missing");
    const a = {
      kind: "setKey",
      data: {
        participantIdentity: r,
        isPublisher: r === ((o = this.room) === null || o === void 0 ? void 0 : o.localParticipant.identity),
        key: n,
        keyIndex: s,
        updateCurrentKeyIndex: t
      }
    };
    this.worker.postMessage(a);
  }
  postEnable(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !1;
    if (this.worker) {
      const r = {
        kind: "enable",
        data: {
          enabled: e,
          participantIdentity: t,
          local: n
        }
      };
      this.worker.postMessage(r);
    } else
      throw new ReferenceError("failed to enable e2ee, worker is not ready");
  }
  postRTPMap(e) {
    var t;
    if (!this.worker)
      throw TypeError("could not post rtp map, worker is missing");
    if (!(!((t = this.room) === null || t === void 0) && t.localParticipant.identity))
      throw TypeError("could not post rtp map, local participant identity is missing");
    const n = {
      kind: "setRTPMap",
      data: {
        map: e,
        participantIdentity: this.room.localParticipant.identity
      }
    };
    this.worker.postMessage(n);
  }
  postSifTrailer(e) {
    if (!this.worker)
      throw Error("could not post SIF trailer, worker is missing");
    const t = {
      kind: "setSifTrailer",
      data: {
        trailer: e
      }
    };
    this.worker.postMessage(t);
  }
  /**
   * Derive the participant's encryption state from one of its publications.
   * Publications without trackInfo are skipped rather than thrown on: throwing
   * inside the forEach above would leave every remaining participant without an
   * encryption state, and a cryptor with unknown state can no longer decrypt.
   */
  setParticipantCryptorEnabledForPublication(e, t) {
    if (!e.trackInfo) {
      this.log.warn("skipping e2ee enabled update for publication without trackInfo", {
        trackSid: e.trackSid
      });
      return;
    }
    this.postEnable(e.trackInfo.encryption !== H.NONE, t);
  }
  setupE2EEReceiver(e, t, n) {
    if (!e.receiver)
      return;
    if (!n?.mimeType || n.mimeType === "")
      throw new TypeError("MimeType missing from trackInfo, cannot set up E2EE cryptor");
    const r = e.kind === "video" && !!n.packetTrailerFeatures && n.packetTrailerFeatures.length > 0;
    this.handleReceiver(e.receiver, e.mediaStreamID, t, e.kind === "video" ? Un(n.mimeType) : void 0, r, n.encryption !== H.NONE);
  }
  setupE2EESender(e, t) {
    var n;
    if (!fn(e) || !t) {
      t || this.log.warn("early return because sender is not ready");
      return;
    }
    const r = yt(e), s = r ? (n = e.publishOptions) === null || n === void 0 ? void 0 : n.videoCodec : void 0;
    this.handleSender(t, e.mediaStreamID, s === "h264" || s === "h265" ? s : void 0, r ? da(e.publishOptions) : void 0);
  }
  /**
   * Handles the given {@code RTCRtpReceiver} by creating a {@code TransformStream} which will inject
   * a frame decoder.
   *
   */
  handleReceiver(e, t, n, r, s, o) {
    return m(this, void 0, void 0, function* () {
      if (this.worker) {
        if (bs()) {
          const a = {
            kind: "decode",
            participantIdentity: n,
            trackId: t,
            codec: r,
            hasPacketTrailer: s,
            encrypted: o
          };
          e.transform = new RTCRtpScriptTransform(this.worker, a);
        } else {
          if (ui in e && hi in e) {
            const l = {
              kind: "updateCodec",
              data: {
                trackId: t,
                previousTrackId: e[hi],
                codec: r,
                participantIdentity: n,
                hasPacketTrailer: s,
                encrypted: o
              }
            };
            this.worker.postMessage(l), e[hi] = t;
            return;
          }
          let a = e.writableStream, c = e.readableStream;
          if (!a || !c) {
            const l = e.createEncodedStreams();
            e.writableStream = l.writable, a = l.writable, e.readableStream = l.readable, c = l.readable;
          }
          const d = {
            kind: "decode",
            data: {
              readableStream: c,
              writableStream: a,
              trackId: t,
              codec: r,
              participantIdentity: n,
              hasPacketTrailer: s,
              encrypted: o
            }
          };
          this.worker.postMessage(d, [c, a]);
        }
        e[ui] = !0, e[hi] = t;
      }
    });
  }
  /**
   * Handles the given {@code RTCRtpSender} by creating a {@code TransformStream} which will inject
   * a frame encoder.
   *
   */
  handleSender(e, t, n, r) {
    var s;
    if (!(ui in e || !this.worker)) {
      if (!(!((s = this.room) === null || s === void 0) && s.localParticipant.identity) || this.room.localParticipant.identity === "")
        throw TypeError("local identity needs to be known in order to set up encrypted sender");
      if (bs()) {
        this.log.info("initialize script transform");
        const o = {
          kind: "encode",
          participantIdentity: this.room.localParticipant.identity,
          trackId: t,
          codec: n,
          hasPacketTrailer: Ui(r),
          packetTrailer: r
        };
        e.transform = new RTCRtpScriptTransform(this.worker, o);
      } else {
        this.log.info("initialize encoded streams");
        const o = e.createEncodedStreams(), a = {
          kind: "encode",
          data: {
            readableStream: o.readable,
            writableStream: o.writable,
            codec: n,
            trackId: t,
            participantIdentity: this.room.localParticipant.identity,
            hasPacketTrailer: Ui(r),
            packetTrailer: r
          }
        };
        this.worker.postMessage(a, [o.readable, o.writable]);
      }
      e[ui] = !0;
    }
  }
}
Ht.disposeRegistry = typeof FinalizationRegistry < "u" && typeof WeakRef < "u" && new FinalizationRegistry((i) => {
  i();
});
const mv = /* @__PURE__ */ ga("e2ee", [], (i, e, t) => {
  const n = !i.options.e2ee, r = t ?? (i.options.encryption || i.options.e2ee);
  let s, o = () => {
  };
  if (r) {
    if ("e2eeManager" in r)
      s = r.e2eeManager, s.isDataChannelEncryptionEnabled = n;
    else {
      const l = new Ht(r, n);
      s = l, o = () => {
        l.dispose(), r.worker.terminate();
      };
    }
    const c = (l, u) => {
      op(u) && (i.isE2EEEnabled = l), i.emit(_.ParticipantEncryptionStatusChanged, l, u);
    }, d = (l, u) => {
      const h = u ? i.getParticipantByIdentity(u) : void 0;
      i.emit(_.EncryptionError, l, h);
    };
    if (s.on(rt.ParticipantEncryptionStatusChanged, c), s.on(rt.EncryptionError, d), "e2eeManager" in r) {
      const l = s;
      o = () => {
        l.off(rt.ParticipantEncryptionStatusChanged, c), l.off(rt.EncryptionError, d);
      };
    }
    s.setup(i), s.setupEngine(i.engine);
  }
  const a = new fe();
  return {
    manager: s,
    e2eeManager: s,
    room: {
      setE2EEEnabled: (c) => m(void 0, void 0, void 0, function* () {
        const d = yield a.lock();
        try {
          if (s)
            i.isE2EEEnabled !== c && (yield i.localParticipant.setE2EEEnabled(c), s.setLocalParticipantCryptorEnabled ? s.setLocalParticipantCryptorEnabled(c) : i.localParticipant.identity !== "" && s.setParticipantCryptorEnabled(c, i.localParticipant.identity));
          else
            throw Error("e2ee not configured, please set e2ee settings within the room options");
        } finally {
          d();
        }
      })
    },
    dispose: o
  };
}), gv = /* @__PURE__ */ ga("frameMetadata", [], (i, e, t) => {
  var n;
  const r = (n = t ?? i.options.frameMetadata) !== null && n !== void 0 ? n : i.options.packetTrailer, s = new Eg(r);
  return s.setup(i), {
    manager: s,
    frameMetadataOptions: r,
    dispose: () => s.dispose()
  };
}), vv = {
  key: /* @__PURE__ */ Symbol("lk.extension.chat"),
  install(i, e) {
    const t = i.localParticipant;
    t.on(x.ChatMessage, (r) => {
      i.emit(_.ChatMessage, r, t);
    });
    const n = (r) => m(this, void 0, void 0, function* () {
      const s = new Ae({
        value: {
          case: "chatMessage",
          value: new zs(Object.assign(Object.assign({}, r), {
            timestamp: te.parse(r.timestamp),
            editTimestamp: r.editTimestamp !== void 0 ? te.parse(r.editTimestamp) : void 0
          }))
        }
      });
      return yield i.engine.sendDataPacket(s, j.RELIABLE), t.emit(x.ChatMessage, r), r;
    });
    return {
      dataPackets: {
        chatMessage: (r, s, o, a) => {
          i.emit(_.ChatMessage, sp(r), a);
        }
      },
      localParticipant: {
        sendChatMessage: (r, s) => n({
          id: crypto.randomUUID(),
          message: r,
          timestamp: Date.now(),
          attachedFiles: s?.attachments
        }),
        editChatMessage: (r, s) => n(Object.assign(Object.assign({}, s), {
          message: r,
          editTimestamp: Date.now()
        }))
      }
    };
  }
}, Hr = /* @__PURE__ */ pe(ne.DataTracks);
class it extends Ve {
  constructor(e, t, n, r) {
    super(19, "Frame ".concat(n, " dropped: ").concat(e), r), this.name = "DataTrackDepacketizerDropError", this.reason = t, this.reasonName = qt[t], this.frameNumber = n;
  }
  static interrupted(e, t) {
    return new it("Interrupted by the start of a new frame ".concat(t), qt.Interrupted, e);
  }
  static unknownFrame(e) {
    return new it("Initial packet was never received.", qt.UnknownFrame, e);
  }
  static bufferFull(e) {
    return new it("Reorder buffer is full.", qt.BufferFull, e);
  }
  static incomplete(e, t, n) {
    return new it("Not all packets received before final packet. Received ".concat(t, " packets, expected ").concat(n, " packets."), qt.Incomplete, e);
  }
}
var qt;
(function(i) {
  i[i.Interrupted = 0] = "Interrupted", i[i.UnknownFrame = 1] = "UnknownFrame", i[i.BufferFull = 2] = "BufferFull", i[i.Incomplete = 3] = "Incomplete";
})(qt || (qt = {}));
class lr {
  constructor() {
    this.partials = /* @__PURE__ */ new Map();
  }
  /** Should be repeatedly called with received {@link DataTrackPacket}s - intermediate calls
   * aggregate the packet's state internally, and return null.
   *
   * Once this method is called with the final packet to form a frame, a new {@link DataTrackFrameInternal}
   * is returned.*/
  push(e, t) {
    switch (e.header.marker) {
      case Z.Single:
        return this.frameFromSingle(e, t);
      case Z.Start:
        return this.beginPartial(e, t);
      case Z.Inter:
      case Z.Final:
        return this.pushToPartial(e);
    }
  }
  reset() {
    this.partials.clear();
  }
  peekOldestPartialFrameNumber() {
    const e = this.partials.keys().next();
    return e.done ? null : e.value;
  }
  frameFromSingle(e, t) {
    var n;
    if (e.header.marker !== Z.Single)
      throw new Error("Depacketizer.frameFromSingle: packet.header.marker was not FrameMarker.Single, found ".concat(e.header.marker, "."));
    const r = (n = t?.maxPartialFrames) !== null && n !== void 0 ? n : 1;
    if (this.partials.size >= r) {
      const s = this.peekOldestPartialFrameNumber();
      if (typeof s != "number")
        throw new Error("Depacketizer.frameFromSingle: no oldest frame number found, but partials.size is ".concat(this.partials.size, "."));
      if (this.partials.delete(s), t?.throwOnInterruption)
        throw it.interrupted(s, e.header.frameNumber.value);
      Hr.warn("Data track frame ".concat(s, " was interrupted by single-packet frame ").concat(e.header.frameNumber.value, ", dropping."));
    }
    return {
      payload: e.payload,
      extensions: e.header.extensions
    };
  }
  /** Begin assembling a new packet. */
  beginPartial(e, t) {
    var n;
    if (e.header.marker !== Z.Start)
      throw new Error("Depacketizer.beginPartial: packet.header.marker was not FrameMarker.Start, found ".concat(e.header.marker, "."));
    const r = e.header.sequence, s = e.header.frameNumber.value, o = {
      startSequence: r,
      extensions: e.header.extensions,
      payloads: /* @__PURE__ */ new Map([[r.value, e.payload]])
    }, a = (n = t?.maxPartialFrames) !== null && n !== void 0 ? n : 1;
    for (; this.partials.size >= a; ) {
      const c = this.peekOldestPartialFrameNumber();
      if (typeof c != "number")
        break;
      if (this.partials.delete(c), t?.throwOnInterruption)
        throw it.interrupted(c, s);
      Hr.warn("Data track partials full (max ".concat(a, "), evicted oldest frame ").concat(c, " to make room for new frame ").concat(s, "."));
    }
    return this.partials.set(s, o), null;
  }
  /** Push to the existing partial frame. */
  pushToPartial(e) {
    if (e.header.marker !== Z.Inter && e.header.marker !== Z.Final)
      throw new Error("Depacketizer.pushToPartial: packet.header.marker was not FrameMarker.Inter or FrameMarker.Final, found ".concat(e.header.marker, "."));
    const t = e.header.frameNumber.value, n = this.partials.get(t);
    if (!n)
      throw this.partials.delete(t), it.unknownFrame(t);
    if (n.payloads.size >= lr.MAX_BUFFER_PACKETS)
      throw this.partials.delete(t), it.bufferFull(t);
    return n.payloads.has(e.header.sequence.value) && Hr.warn("Data track frame ".concat(t, " received duplicate packet for sequence ").concat(e.header.sequence.value, ", so replacing with newly received packet.")), n.payloads.set(e.header.sequence.value, e.payload), e.header.marker === Z.Final ? this.finalize(t, n, e.header.sequence.value) : null;
  }
  /** Try to reassemble the complete frame. */
  finalize(e, t, n) {
    const r = t.payloads.size;
    let s = 0;
    for (const d of t.payloads.values())
      s += d.length;
    const o = new Uint8Array(s);
    let a = t.startSequence.clone(), c = 0;
    for (; ; ) {
      const d = t.payloads.get(a.value);
      if (!d)
        break;
      t.payloads.delete(a.value);
      const l = o.length - c;
      if (d.length > l)
        throw new Error("Depacketizer.finalize: Expected at least ".concat(d.length, " more bytes left in the payload buffer, only got ").concat(l, " bytes."));
      if (o.set(d, c), c += d.length, a.value != n) {
        a.increment();
        continue;
      }
      return this.partials.delete(e), {
        payload: o,
        extensions: t.extensions
      };
    }
    throw this.partials.delete(e), it.incomplete(e, r, n - t.startSequence.value + 1);
  }
}
lr.MAX_BUFFER_PACKETS = 128;
var Vt;
(function(i) {
  i[i.Unpublished = 0] = "Unpublished", i[i.Timeout = 1] = "Timeout", i[i.Disconnected = 2] = "Disconnected", i[i.Cancelled = 4] = "Cancelled";
})(Vt || (Vt = {}));
class Re extends Ve {
  constructor(e, t, n) {
    super(22, e, n), this.name = "DataTrackSubscribeError", this.reason = t, this.reasonName = Vt[t];
  }
  static unpublished() {
    return new Re("The track has been unpublished and is no longer available", Vt.Unpublished);
  }
  static timeout() {
    return new Re("Request to subscribe to data track timed-out", Vt.Timeout);
  }
  static disconnected() {
    return new Re("Cannot subscribe to data track when disconnected", Vt.Disconnected);
  }
  // NOTE: this was introduced by web / there isn't a corresponding case in the rust version.
  static cancelled() {
    return new Re("Subscription to data track cancelled by caller", Vt.Cancelled);
  }
}
const zr = /* @__PURE__ */ pe(ne.DataTracks);
class bv {
  /**
   * Creates a new pipeline with the given options.
   */
  constructor(e) {
    var t, n;
    const r = e.e2eeManager !== null;
    if (e.info.usesE2ee !== r)
      throw new Error("IncomingDataTrackPipeline: DataTrackInfo.usesE2ee must match presence of decryptionProvider");
    const s = new lr();
    this.publisherIdentity = e.publisherIdentity, this.e2eeManager = (t = e.e2eeManager) !== null && t !== void 0 ? t : null, this.depacketizer = s, this.options = (n = e.pipelineOptions) !== null && n !== void 0 ? n : {};
  }
  updateE2eeManager(e) {
    this.e2eeManager = e;
  }
  setOptions(e) {
    this.options = e;
  }
  processPacket(e) {
    return m(this, void 0, void 0, function* () {
      const t = this.depacketize(e);
      if (!t)
        return null;
      const n = yield this.decryptIfNeeded(t);
      return n || null;
    });
  }
  /**
   * Depacketize the given frame, log if a drop occurs.
   */
  depacketize(e) {
    let t;
    try {
      t = this.depacketizer.push(e, {
        throwOnInterruption: !1,
        maxPartialFrames: this.options.maxPartialFrames
      });
    } catch (n) {
      return zr.warn("Data frame depacketize error: ".concat(n)), null;
    }
    return t;
  }
  /**
   * Decrypt the frame's payload if E2EE is enabled for this track.
   */
  decryptIfNeeded(e) {
    return m(this, void 0, void 0, function* () {
      var t, n;
      const r = this.e2eeManager;
      if (!r)
        return e;
      const s = (n = (t = e.extensions) === null || t === void 0 ? void 0 : t.e2ee) !== null && n !== void 0 ? n : null;
      if (!s)
        return zr.error("Missing E2EE meta"), null;
      let o;
      try {
        o = yield r.handleEncryptedData(e.payload, s.iv, this.publisherIdentity, s.keyIndex);
      } catch (a) {
        return zr.error("Error decrypting packet: ".concat(a)), null;
      }
      return e.payload = o.payload, e;
    });
  }
}
const oe = /* @__PURE__ */ pe(ne.DataTracks), yv = 1e4, kv = 16;
class Tv extends xe.EventEmitter {
  constructor(e) {
    var t;
    super(), this.descriptors = /* @__PURE__ */ new Map(), this.subscriptionHandles = /* @__PURE__ */ new Map(), this.e2eeManager = (t = e?.e2eeManager) !== null && t !== void 0 ? t : null;
  }
  /** @internal */
  updateE2eeManager(e) {
    this.e2eeManager = e;
    for (const t of this.descriptors.values())
      t.subscription.type === "active" && t.subscription.pipeline.updateE2eeManager(e);
  }
  /** @internal */
  setPipelineOptions(e, t) {
    const n = this.descriptors.get(e);
    if (!n) {
      oe.warn("Unknown track ".concat(e, ", cannot set pipeline options."));
      return;
    }
    n.pipelineOptions = t, n.subscription.type === "active" && n.subscription.pipeline.setOptions(t);
  }
  /** Allocates a ReadableStream which emits when a new {@link DataTrackFrame} is received from the
   * SFU. The SFU subscription is initiated lazily when the stream is created.
   *
   * @returns A tuple of the ReadableStream and a Promise that resolves once the SFU subscription
   * is fully established / the stream is ready to receive frames.
   *
   * @internal
   **/
  openSubscriptionStream(e, t) {
    let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : kv, r = null;
    const s = new ye(), o = this.descriptors.get(e), a = () => {
      t?.removeEventListener("abort", d);
    }, c = () => {
      if (a(), !r) {
        oe.warn("ReadableStream subscribed to ".concat(e, " was not started."));
        return;
      }
      if (!o || this.descriptors.get(o.info.sid) !== o) {
        oe.warn("Unknown track ".concat(e, ", skipping cancel..."));
        return;
      }
      if (o.subscription.type !== "active") {
        oe.warn("Subscription for track ".concat(e, " is not active, skipping cancel..."));
        return;
      }
      o.subscription.streamControllers.delete(r), o.subscription.streamControllers.size === 0 && this.unSubscribeRequest(o.info.sid);
    }, d = () => {
      var u;
      r && (o?.subscription.type === "active" && o.subscription.streamControllers.delete(r), r.error(Re.cancelled()), (u = s.reject) === null || u === void 0 || u.call(s, Re.cancelled()), c());
    };
    return [new ReadableStream({
      start: (u) => {
        r = u, this.subscribeRequest(e, t).then(() => m(this, void 0, void 0, function* () {
          var h, f, g;
          if (!o || this.descriptors.get(o.info.sid) !== o) {
            oe.error("Unknown track ".concat(e));
            const p = Re.disconnected();
            u.error(p), (h = s.reject) === null || h === void 0 || h.call(s, p);
            return;
          }
          if (o.subscription.type !== "active") {
            oe.error("Subscription for track ".concat(e, " is not active"));
            const p = Re.disconnected();
            u.error(p), (f = s.reject) === null || f === void 0 || f.call(s, p);
            return;
          }
          if (t?.aborted) {
            d();
            return;
          }
          t?.addEventListener("abort", d), o.subscription.streamControllers.set(u, a), (g = s.resolve) === null || g === void 0 || g.call(s);
        })).catch((h) => {
          var f;
          u.error(h), (f = s.reject) === null || f === void 0 || f.call(s, h);
        });
      },
      cancel: () => {
        c();
      }
    }, new CountQueuingStrategy({
      highWaterMark: n
    })), s.promise];
  }
  /** Client requested to subscribe to a data track.
   *
   * This is sent when the user calls {@link RemoteDataTrack.subscribe}.
   *
   * Only the first request to subscribe to a given track incurs meaningful overhead; subsequent
   * requests simply attach an additional receiver to the broadcast channel, allowing them to consume
   * frames from the existing subscription pipeline.
   */
  subscribeRequest(e, t) {
    return m(this, void 0, void 0, function* () {
      const n = this.descriptors.get(e);
      if (!n)
        throw new Error("Cannot subscribe to unknown track");
      const r = (s, o, a) => m(this, void 0, void 0, function* () {
        if (s.subscription.type === "active")
          return;
        if (s.subscription.type !== "pending")
          throw new Error("Descriptor for track ".concat(e, " is not pending, found ").concat(s.subscription.type));
        const c = ul([o, a].filter((u) => typeof u < "u")), d = new ye();
        s.subscription.completionFuture.promise.then(() => {
          var u;
          return (u = d.resolve) === null || u === void 0 ? void 0 : u.call(d);
        }).catch((u) => {
          var h;
          return (h = d.reject) === null || h === void 0 ? void 0 : h.call(d, u);
        });
        const l = () => {
          var u;
          if (s.subscription.type === "pending") {
            if (s.subscription.pendingRequestCount -= 1, a?.aborted) {
              s.subscription.cancel();
              return;
            }
            if (s.subscription.pendingRequestCount <= 0) {
              s.subscription.cancel();
              return;
            }
            (u = d.reject) === null || u === void 0 || u.call(d, Re.cancelled());
          }
        };
        c.aborted && l(), c.addEventListener("abort", l), yield d.promise, c.removeEventListener("abort", l);
      });
      switch (n.subscription.type) {
        case "none": {
          n.subscription = {
            type: "pending",
            completionFuture: new ye(),
            pendingRequestCount: 1,
            cancel: () => {
              var o, a;
              const c = n.subscription;
              n.subscription = {
                type: "none"
              }, this.emit("sfuUpdateSubscription", {
                sid: n.info.sid,
                subscribe: !1
              }), c.type === "pending" && ((a = (o = c.completionFuture).reject) === null || a === void 0 || a.call(o, s.aborted ? Re.timeout() : (
                // NOTE: the below cancelled case was introduced by web / there isn't a corresponding case in the rust version.
                Re.cancelled()
              )));
            }
          }, this.emit("sfuUpdateSubscription", {
            sid: e,
            subscribe: !0
          });
          const s = la(yv);
          yield r(n, t, s);
          return;
        }
        case "pending": {
          n.subscription.pendingRequestCount += 1, yield r(n, t);
          return;
        }
        case "active":
          return;
      }
    });
  }
  /**
   * Get information about all currently subscribed tracks.
   * @internal */
  querySubscribed() {
    return m(this, void 0, void 0, function* () {
      return Array.from(this.descriptors.values()).filter((t) => t.subscription.type === "active").map((t) => [t.info, t.publisherIdentity]);
    });
  }
  /** Client requested to unsubscribe from a data track. */
  unSubscribeRequest(e) {
    var t;
    const n = this.descriptors.get(e);
    if (!n)
      throw new Error("Cannot subscribe to unknown track");
    if (n.subscription.type !== "active") {
      oe.warn("Unexpected descriptor state in unSubscribeRequest, expected active, found ".concat((t = n.subscription) === null || t === void 0 ? void 0 : t.type));
      return;
    }
    this.closeStreamControllers(n.subscription.streamControllers, e);
    const r = n.subscription;
    n.subscription = {
      type: "none"
    }, this.subscriptionHandles.delete(r.subcriptionHandle), this.emit("sfuUpdateSubscription", {
      sid: e,
      subscribe: !1
    });
  }
  /** Detach abort-signal listeners and close all downstream stream controllers for an active
   * subscription. Used when the subscription is being torn down by the manager (unsubscribe,
   * unpublish, or shutdown). */
  closeStreamControllers(e, t) {
    for (const r of e) {
      var n = L(r, 2);
      const s = n[0], o = n[1];
      o();
      try {
        s.close();
      } catch (a) {
        oe.warn("Failed to close readable stream for track ".concat(t, ": ").concat(a));
      }
    }
  }
  /** SFU notification that track publications have changed.
   *
   * This event is produced from both {@link JoinResponse} and {@link ParticipantUpdate}
   * to provide a complete view of remote participants' track publications:
   *
   * - From a `JoinResponse`, it captures the initial set of tracks published when a participant joins.
   * - From a `ParticipantUpdate`, it captures subsequent changes (i.e., new tracks being
   *   published and existing tracks unpublished).
   */
  receiveSfuPublicationUpdates(e) {
    return m(this, void 0, void 0, function* () {
      if (e.size === 0)
        return;
      const t = /* @__PURE__ */ new Map();
      for (const s of e.entries()) {
        var n = L(s, 2);
        const o = n[0], a = n[1], c = /* @__PURE__ */ new Set();
        for (const d of a)
          c.add(d.sid), !this.descriptors.has(d.sid) && (this.handleSidReassigned(o, d) || (yield this.handleTrackPublished(o, d)));
        t.set(o, c);
      }
      for (const s of t.entries()) {
        var r = L(s, 2);
        const o = r[0], a = r[1];
        let d = Array.from(this.descriptors.entries()).filter((l) => {
          let u = L(l, 2);
          return u[0], u[1].publisherIdentity === o;
        }).map((l) => L(l, 1)[0]).filter((l) => !a.has(l));
        for (const l of d)
          this.handleTrackUnpublished(l);
      }
    });
  }
  /**
   * Get information about all currently remotely published tracks which could be subscribed to.
   * @internal */
  queryPublications() {
    return m(this, void 0, void 0, function* () {
      return Array.from(this.descriptors.values()).map((e) => e.info);
    });
  }
  handleTrackPublished(e, t) {
    return m(this, void 0, void 0, function* () {
      if (this.descriptors.has(t.sid)) {
        oe.error("Existing descriptor for track ".concat(t.sid));
        return;
      }
      let n = {
        info: t,
        publisherIdentity: e,
        subscription: {
          type: "none"
        },
        pipelineOptions: {}
      };
      this.descriptors.set(n.info.sid, n);
      const r = new Rl(n.info, this, {
        publisherIdentity: e
      });
      this.emit("trackPublished", {
        track: r
      });
    });
  }
  /**
   * Detects and handles SID reassignment, which occurs when the publisher
   * republishes its tracks after a full reconnect.
   *
   * Returns `true` if an SID reassignment occurred, `false` otherwise.
   */
  handleSidReassigned(e, t) {
    const n = Array.from(this.descriptors.entries()).find((u) => {
      let h = L(u, 2);
      h[0];
      let f = h[1];
      return f.publisherIdentity === e && f.info.pubHandle === t.pubHandle;
    });
    if (!n)
      return !1;
    const r = L(n, 2), s = r[0], o = r[1], a = o.info, c = a.name, d = a.usesE2ee;
    if (c !== t.name || d !== t.usesE2ee)
      return oe.warn("Info mismatch for ".concat(s, ", treating as new publication")), !1;
    const l = t.sid;
    if (oe.debug("SID reassigned: ".concat(s, " -> ").concat(l)), !this.descriptors.delete(s))
      return !1;
    switch (o.info.sid = l, o.subscription.type) {
      case "none":
        break;
      case "pending":
      case "active":
        this.emit("sfuUpdateSubscription", {
          sid: l,
          subscribe: !0
        });
        break;
    }
    return o.subscription.type === "active" && this.subscriptionHandles.set(o.subscription.subcriptionHandle, l), this.descriptors.set(l, o), !0;
  }
  handleTrackUnpublished(e) {
    const t = this.descriptors.get(e);
    if (!t) {
      oe.error("Unknown track ".concat(e));
      return;
    }
    this.descriptors.delete(e), t.subscription.type === "active" && (this.closeStreamControllers(t.subscription.streamControllers, e), this.subscriptionHandles.delete(t.subscription.subcriptionHandle)), this.emit("trackUnpublished", {
      sid: e,
      publisherIdentity: t.publisherIdentity
    });
  }
  /** SFU notification that handles have been assigned for requested subscriptions. */
  receivedSfuSubscriberHandles(e) {
    for (const n of e.entries()) {
      var t = L(n, 2);
      const r = t[0], s = t[1];
      this.registerSubscriberHandle(r, s);
    }
  }
  registerSubscriberHandle(e, t) {
    var n, r;
    const s = this.descriptors.get(t);
    if (!s) {
      oe.error("Unknown track ".concat(t));
      return;
    }
    switch (s.subscription.type) {
      case "none": {
        oe.warn("No subscription for ".concat(t));
        return;
      }
      case "active": {
        this.subscriptionHandles.delete(s.subscription.subcriptionHandle), s.subscription.subcriptionHandle = e, this.subscriptionHandles.set(e, t);
        return;
      }
      case "pending": {
        oe.debug("data track subscription activated", {
          sid: t,
          handle: e
        });
        const o = new bv({
          info: s.info,
          publisherIdentity: s.publisherIdentity,
          e2eeManager: this.e2eeManager,
          pipelineOptions: s.pipelineOptions
        }), a = s.subscription;
        s.subscription = {
          type: "active",
          subcriptionHandle: e,
          pipeline: o,
          streamControllers: /* @__PURE__ */ new Map()
        }, this.subscriptionHandles.set(e, t), (r = (n = a.completionFuture).resolve) === null || r === void 0 || r.call(n);
      }
    }
  }
  /** Packet has been received over the transport. */
  packetReceived(e) {
    return m(this, void 0, void 0, function* () {
      let t;
      try {
        var n = or.fromBinary(e), r = L(n, 1);
        t = r[0];
      } catch (c) {
        oe.error("Failed to deserialize packet: ".concat(c));
        return;
      }
      const s = this.subscriptionHandles.get(t.header.trackHandle);
      if (!s) {
        oe.warn("Unknown subscriber handle ".concat(t.header.trackHandle));
        return;
      }
      const o = this.descriptors.get(s);
      if (!o) {
        oe.error("Missing descriptor for track ".concat(s));
        return;
      }
      if (o.subscription.type !== "active") {
        oe.warn("Received packet for track ".concat(s, " without active subscription"));
        return;
      }
      const a = yield o.subscription.pipeline.processPacket(t);
      if (a)
        for (const c of o.subscription.streamControllers.keys()) {
          if (c.desiredSize !== null && c.desiredSize <= 0) {
            oe.warn("Cannot send frame to subscribers: readable stream is full (desiredSize is ".concat(c.desiredSize, "). To increase this threshold, set a higher 'options.highWaterMark' when calling .subscribe()."));
            continue;
          }
          const d = El.lossyIntoFrame(a);
          c.enqueue(d);
        }
    });
  }
  /** Resend all subscription updates.
   *
   * This must be sent after a full reconnect to ensure the SFU knows which
   * tracks are subscribed to locally.
   */
  resendSubscriptionUpdates() {
    for (const t of this.descriptors) {
      var e = L(t, 2);
      const n = e[0];
      e[1].subscription.type !== "none" && this.emit("sfuUpdateSubscription", {
        sid: n,
        subscribe: !0
      });
    }
  }
  /** Called when a remote participant is disconnected so that any pending data tracks can be
   * cancelled. */
  handleRemoteParticipantDisconnected(e) {
    var t, n;
    for (const r of this.descriptors.values())
      if (r.publisherIdentity === e)
        switch (r.subscription.type) {
          case "none":
            break;
          case "pending":
            (n = (t = r.subscription.completionFuture).reject) === null || n === void 0 || n.call(t, Re.disconnected());
            break;
          case "active":
            this.unSubscribeRequest(r.info.sid);
            break;
        }
  }
  /** Resets the manager, ending any subscriptions, and getting it ready for the next room
   * connection.  */
  reset() {
    var e, t;
    for (const n of this.descriptors.values())
      this.emit("trackUnpublished", {
        sid: n.info.sid,
        publisherIdentity: n.publisherIdentity
      }), n.subscription.type === "pending" && ((t = (e = n.subscription.completionFuture).reject) === null || t === void 0 || t.call(e, Re.disconnected())), n.subscription.type === "active" && this.closeStreamControllers(n.subscription.streamControllers, n.info.sid);
    this.descriptors.clear(), this.subscriptionHandles.clear();
  }
}
class ur {
  constructor(e) {
    this.e2eeManager = e.e2eeManager, this.packetizer = new Sa(e.info.pubHandle, ur.TRANSPORT_MTU_BYTES);
  }
  updateE2eeManager(e) {
    this.e2eeManager = e;
  }
  processFrame(e) {
    return Gd(this, arguments, function* () {
      const n = yield bt(this.encryptIfNeeded(e));
      try {
        yield bt(yield* gf(je(this.packetizer.packetize(n))));
      } catch (r) {
        throw r instanceof cr ? ti.packetizer(r) : r;
      }
    });
  }
  encryptIfNeeded(e) {
    return m(this, void 0, void 0, function* () {
      if (!this.e2eeManager)
        return e;
      let t;
      try {
        t = yield this.e2eeManager.encryptData(e.payload);
      } catch (n) {
        throw ti.encryption(n);
      }
      return e.payload = t.payload, e.extensions.e2ee = new Je(t.keyIndex, t.iv), e;
    });
  }
}
ur.TRANSPORT_MTU_BYTES = 16e3;
const Ne = /* @__PURE__ */ pe(ne.DataTracks), lc = {
  pending() {
    return {
      type: "pending",
      completionFuture: new ye()
    };
  },
  active(i, e) {
    return {
      type: "active",
      info: i,
      publishState: "published",
      pipeline: new ur({
        info: i,
        e2eeManager: e
      }),
      unpublishingFuture: new ye()
    };
  }
}, Sv = 1e4;
class Ea extends xe.EventEmitter {
  constructor(e) {
    var t;
    super(), this.handleAllocator = new cg(), this.descriptors = /* @__PURE__ */ new Map(), this.inFlightPacketCounter = /* @__PURE__ */ new Map(), this.e2eeManager = (t = e?.e2eeManager) !== null && t !== void 0 ? t : null;
  }
  static withDescriptors(e) {
    const t = new Ea();
    return t.descriptors = e, t;
  }
  /** @internal */
  updateE2eeManager(e) {
    this.e2eeManager = e;
    for (const t of this.descriptors.values())
      t.type === "active" && t.pipeline.updateE2eeManager(e);
  }
  /**
   * Used by attached {@link LocalDataTrack} instances to query their associated descriptor info.
   * @internal
   */
  getDescriptor(e) {
    var t;
    return (t = this.descriptors.get(e)) !== null && t !== void 0 ? t : null;
  }
  /** Used by attached {@link LocalDataTrack} instances to broadcast data track packets to other
   * subscribers.
   * @internal
   */
  tryProcessAndSend(e, t) {
    return m(this, void 0, void 0, function* () {
      var n, r, s, o, a;
      const c = this.getDescriptor(e);
      if (c?.type !== "active" || c.publishState === "unpublished")
        throw Pt.trackUnpublished();
      if (c.publishState === "republishing")
        throw Pt.dropped("Data track republishing");
      try {
        try {
          for (var d = !0, l = je(c.pipeline.processFrame(t)), u; u = yield l.next(), n = u.done, !n; d = !0) {
            o = u.value, d = !1;
            const h = o, f = (a = this.inFlightPacketCounter.get(e)) !== null && a !== void 0 ? a : 0;
            this.inFlightPacketCounter.set(e, f + 1), f === 0 && this.emit("packetsFlushedChange", {
              handle: e,
              isFlushed: !1
            }), this.emit("packetAvailable", {
              handle: e,
              bytes: h.toBinary()
            });
          }
        } catch (h) {
          r = {
            error: h
          };
        } finally {
          try {
            !d && !n && (s = l.return) && (yield s.call(l));
          } finally {
            if (r) throw r.error;
          }
        }
      } catch (h) {
        throw Pt.dropped(h);
      }
    });
  }
  /** The client has sent a packet over the rtc data channel. This signal is used for determining
   * once all packets are sent and a data track has been "flushed".
   *
   * @internal */
  handlePacketSendComplete(e) {
    var t;
    let r = ((t = this.inFlightPacketCounter.get(e)) !== null && t !== void 0 ? t : 0) - 1;
    r < 0 && (Ne.warn("OutgoingDataTrackManager.handlePacketSendComplete: inFlightPacketCounter was decremented below 0 (got ".concat(this.inFlightPacketCounter, " - resetting to 0. Were more packets send than were emitted?")), r = 0), this.inFlightPacketCounter.set(e, r), r === 0 && this.emit("packetsFlushedChange", {
      handle: e,
      isFlushed: !0
    });
  }
  /**
   * Client requested to publish a track.
   *
   * If the LiveKit server is too old and doesn't support data tracks, a
   * {@link DataTrackPublishError#timeout} will be thrown.
   *
   * @internal
   **/
  publishRequest(e, t) {
    return m(this, void 0, void 0, function* () {
      const n = this.handleAllocator.get();
      if (!n)
        throw ue.limitReached();
      const r = la(Sv), s = t ? ul([t, r]) : r;
      if (this.descriptors.has(n))
        throw new Error("Descriptor for handle already exists");
      const o = lc.pending();
      this.descriptors.set(n, o);
      const a = () => {
        var c, d;
        const l = this.descriptors.get(n);
        if (!l) {
          Ne.warn("No descriptor for ".concat(n));
          return;
        }
        this.descriptors.delete(n), this.emit("sfuUnpublishRequest", {
          handle: n
        }), l.type === "pending" && ((d = (c = l.completionFuture).reject) === null || d === void 0 || d.call(c, r.aborted ? ue.timeout() : (
          // NOTE: the below cancelled case was introduced by web / there isn't a corresponding case in the rust version.
          ue.cancelled()
        )));
      };
      return s.aborted ? (a(), o.completionFuture.promise.then(
        () => n
        /* no-op, makes typescript happy */
      )) : (s.addEventListener("abort", a), this.emit("sfuPublishRequest", {
        handle: n,
        name: e.name,
        usesE2ee: this.e2eeManager !== null
      }), yield o.completionFuture.promise, s.removeEventListener("abort", a), this.emit("trackPublished", {
        track: dr.withExplicitHandle(e, this, n)
      }), n);
    });
  }
  /**
   * Get information about all currently published tracks.
   * @internal
   **/
  queryPublished() {
    return Array.from(this.descriptors.values()).filter((t) => t.type === "active").map((t) => t.info);
  }
  /**
   * Client request to unpublish a track.
   * @internal
   **/
  unpublishRequest(e) {
    return m(this, void 0, void 0, function* () {
      const t = this.descriptors.get(e);
      if (!t) {
        Ne.warn("No descriptor for ".concat(e));
        return;
      }
      if (t.type !== "active") {
        Ne.warn("Track ".concat(e, " not active"));
        return;
      }
      this.emit("sfuUnpublishRequest", {
        handle: e
      }), yield t.unpublishingFuture.promise, this.inFlightPacketCounter.delete(e), this.emit("trackUnpublished", {
        sid: t.info.sid
      });
    });
  }
  /**
   * SFU responded to a request to publish a data track.
   * @internal
   **/
  receivedSfuPublishResponse(e, t) {
    var n, r, s, o;
    const a = this.descriptors.get(e);
    if (!a) {
      Ne.warn("No descriptor for ".concat(e));
      return;
    }
    switch (this.descriptors.delete(e), a.type) {
      case "pending": {
        if (t.type === "ok") {
          const c = t.data;
          Ne.debug("SFU accepted publish request for handle ".concat(e), {
            sid: c.sid
          });
          const d = c.usesE2ee ? this.e2eeManager : null;
          this.descriptors.set(c.pubHandle, lc.active(c, d)), (r = (n = a.completionFuture).resolve) === null || r === void 0 || r.call(n);
        } else
          Ne.debug("SFU rejected publish request for handle ".concat(e), {
            error: t.error
          }), (o = (s = a.completionFuture).reject) === null || o === void 0 || o.call(s, t.error);
        return;
      }
      case "active": {
        if (a.publishState !== "republishing") {
          Ne.warn("Track ".concat(e, " already active"));
          return;
        }
        if (t.type === "error") {
          Ne.warn("Republish failed for track ".concat(e, ": ").concat(t.error)), a.publishState = "unpublished";
          return;
        }
        Ne.debug("Track ".concat(e, " republished")), a.info.sid = t.data.sid, a.publishState = "published", this.descriptors.set(a.info.pubHandle, a);
      }
    }
  }
  /**
   * SFU notification that a track has been unpublished.
   * @internal
   **/
  receivedSfuUnpublishResponse(e) {
    var t, n;
    const r = this.descriptors.get(e);
    if (!r) {
      Ne.warn("No descriptor for ".concat(e));
      return;
    }
    if (this.descriptors.delete(e), r.type !== "active") {
      Ne.warn("Track ".concat(e, " not active"));
      return;
    }
    r.publishState = "unpublished", (n = (t = r.unpublishingFuture).resolve) === null || n === void 0 || n.call(t);
  }
  /** Republish all tracks.
   *
   * This must be sent after a full reconnect in order for existing publications
   * to be recognized by the SFU. Each republished track will be assigned a new SID.
   * Tracks the SFU rejects are unpublished.
   * @internal
   */
  sfuWillRepublishTracks() {
    var e, t;
    for (const r of this.descriptors.entries()) {
      var n = L(r, 2);
      const s = n[0], o = n[1];
      switch (o.type) {
        case "pending":
          this.descriptors.delete(s), (t = (e = o.completionFuture).reject) === null || t === void 0 || t.call(e, ue.disconnected());
          break;
        case "active":
          o.publishState = "republishing", this.emit("sfuPublishRequest", {
            handle: o.info.pubHandle,
            name: o.info.name,
            usesE2ee: o.info.usesE2ee
          });
      }
    }
  }
  /**
   * Reset's the state of the manager and all associated tracks. Run on room disconnect to get
   * the manager ready for the next room connection.
   * @internal
   **/
  reset() {
    return m(this, void 0, void 0, function* () {
      var e, t, n, r;
      this.handleAllocator.reset();
      for (const s of this.descriptors.values())
        switch (s.type) {
          case "pending":
            (t = (e = s.completionFuture).reject) === null || t === void 0 || t.call(e, ue.disconnected());
            break;
          case "active":
            (r = (n = s.unpublishingFuture).resolve) === null || r === void 0 || r.call(n), yield this.unpublishRequest(s.info.pubHandle);
            break;
        }
      this.descriptors.clear(), this.inFlightPacketCounter.clear(), this.emit("reset");
    });
  }
}
const uc = (i) => i.map((e) => Is.from(e)), Cv = {
  key: /* @__PURE__ */ Symbol("lk.extension.dataTracks"),
  install(i, e) {
    const t = new Tv(), n = new Ea();
    t.on("sfuUpdateSubscription", (d) => {
      i.engine.client.sendUpdateDataSubscription(d.sid, d.subscribe);
    }).on("trackPublished", (d) => {
      var l;
      d.track.publisherIdentity !== i.localParticipant.identity && (i.emit(_.DataTrackPublished, d.track), (l = i.remoteParticipants.get(d.track.publisherIdentity)) === null || l === void 0 || l.addRemoteDataTrack(d.track));
    }).on("trackUnpublished", (d) => {
      var l;
      d.publisherIdentity !== i.localParticipant.identity && (i.emit(_.DataTrackUnpublished, d.sid), (l = i.remoteParticipants.get(d.publisherIdentity)) === null || l === void 0 || l.removeRemoteDataTrack(d.sid));
    }), n.on("sfuPublishRequest", (d) => {
      i.engine.client.sendPublishDataTrackRequest(d.handle, d.name, d.usesE2ee);
    }).on("sfuUnpublishRequest", (d) => {
      i.engine.client.sendUnPublishDataTrackRequest(d.handle);
    }).on("trackPublished", (d) => {
      i.emit(_.LocalDataTrackPublished, d.track);
    }).on("trackUnpublished", (d) => {
      i.emit(_.LocalDataTrackUnpublished, d.sid);
    }).on("packetAvailable", (d) => {
      let l = d.handle, u = d.bytes;
      i.engine.sendDataTrackFrame(u).finally(() => n.handlePacketSendComplete(l));
    });
    const r = (d) => {
      var l;
      const u = (l = e.slot("e2eeManager")) !== null && l !== void 0 ? l : null;
      t.updateE2eeManager(u), n.updateE2eeManager(u), d.on(P.PublishDataTrackResponse, (h) => {
        if (!h.info) {
          e.log.warn("received PublishDataTrackResponse, but event.info was ".concat(h.info, ", so skipping."));
          return;
        }
        n.receivedSfuPublishResponse(h.info.pubHandle, {
          type: "ok",
          data: {
            sid: h.info.sid,
            pubHandle: h.info.pubHandle,
            name: h.info.name,
            usesE2ee: h.info.encryption !== H.NONE
          }
        });
      }).on(P.UnPublishDataTrackResponse, (h) => {
        if (!h.info) {
          e.log.warn("received UnPublishDataTrackResponse, but event.info was ".concat(h.info, ", so skipping."));
          return;
        }
        n.receivedSfuUnpublishResponse(h.info.pubHandle);
      }).on(P.DataTrackSubscriberHandles, (h) => {
        const f = new Map(Object.entries(h.subHandles).map((g) => {
          let p = L(g, 2), y = p[0], k = p[1];
          return [parseInt(y, 10), k.trackSid];
        }));
        t.receivedSfuSubscriberHandles(f);
      }).on(P.DataTrackPacketReceived, (h) => {
        try {
          t.packetReceived(h);
        } catch (f) {
          throw f;
        }
      }).on(P.Joined, (h) => {
        t.receiveSfuPublicationUpdates(new Map(h.otherParticipants.map((f) => [f.identity, uc(f.dataTracks)])));
      }).on(P.Restarted, () => {
        n.sfuWillRepublishTracks(), t.resendSubscriptionUpdates();
      }).on(P.SignalRequestResponse, (h) => {
        if (h.request.case !== "publishDataTrack")
          return;
        let f;
        switch (h.reason) {
          case Wt.NOT_ALLOWED:
            f = ue.notAllowed(h.message);
            break;
          case Wt.DUPLICATE_NAME:
            f = ue.duplicateName(h.message);
            break;
          case Wt.INVALID_NAME:
            f = ue.invalidName(h.message);
            break;
          case Wt.LIMIT_EXCEEDED:
            f = ue.limitReached(h.message);
            break;
          default:
            f = ue.unknown(h.reason, h.message);
            break;
        }
        n.receivedSfuPublishResponse(h.request.value.pubHandle, {
          type: "error",
          error: f
        });
      });
    }, s = () => {
      t.reset(), n.reset();
    }, o = (d, l) => {
      for (const u of l.dataTracks)
        d.addRemoteDataTrack(new Rl(Is.from(u), t, {
          publisherIdentity: l.identity
        }));
    }, a = (d) => {
      t.receiveSfuPublicationUpdates(new Map(d.filter((l) => l.identity !== i.localParticipant.identity).map((l) => [l.identity, uc(l.dataTracks)])));
    }, c = () => n.queryPublished().map((d) => new Qs({
      info: Is.toProtobuf(d)
    }));
    return i.on(_.ParticipantDisconnected, (d) => t.handleRemoteParticipantDisconnected(d.identity)), {
      incoming: t,
      outgoing: n,
      onEngineCreated: r,
      onDisconnect: s,
      onParticipantCreated: o,
      onParticipantUpdates: a,
      syncState: c,
      localParticipant: {
        publishDataTrack: (d) => m(this, void 0, void 0, function* () {
          const l = new dr(d, n);
          return yield l.publish(), l;
        })
      }
    };
  }
}, xs = {
  key: /* @__PURE__ */ Symbol("lk.extension.rpc"),
  requires: [Hi],
  install(i, e) {
    const t = e.get(Hi), n = t.incoming, r = t.outgoing, s = (l) => {
      var u, h;
      return (h = (u = i.remoteParticipants.get(l)) === null || u === void 0 ? void 0 : u.clientProtocol) !== null && h !== void 0 ? h : ra;
    }, o = new Tg(e.log, r, s, () => {
      var l;
      return (l = i.engine) === null || l === void 0 ? void 0 : l.serverVersion;
    });
    o.on("sendDataPacket", (l) => {
      let u = l.packet;
      var h;
      (h = i.engine) === null || h === void 0 || h.sendDataPacket(u, j.RELIABLE);
    });
    const a = new Sg(e.log, r, s);
    return a.on("sendDataPacket", (l) => {
      let u = l.packet;
      var h;
      (h = i.engine) === null || h === void 0 || h.sendDataPacket(u, j.RELIABLE);
    }), n.registerTextStreamHandler(Nl, (l, u) => m(this, [l, u], void 0, function(h, f) {
      let g = f.identity;
      return (function* () {
        var p;
        yield a.handleIncomingDataStream(h, g, (p = h.info.attributes) !== null && p !== void 0 ? p : {});
      })();
    })), n.registerTextStreamHandler(Ul, (l, u) => m(this, [l, u], void 0, function(h, f) {
      let g = f.identity;
      return (function* () {
        var p;
        yield o.handleIncomingDataStream(h, g, (p = h.info.attributes) !== null && p !== void 0 ? p : {});
      })();
    })), i.on(_.ParticipantDisconnected, (l) => o.handleParticipantDisconnected(l.identity)), {
      dataPackets: {
        rpcRequest: (l, u) => {
          a.handleIncomingRpcRequest(u.participantIdentity, l);
        },
        rpcResponse: (l) => {
          switch (l.value.case) {
            case "payload":
              o.handleIncomingRpcResponseSuccess(l.requestId, l.value.value);
              break;
            case "error":
              o.handleIncomingRpcResponseFailure(l.requestId, G.fromProto(l.value.value));
              break;
            default:
              e.log.warn("Unknown rpcResponse.value.case: ".concat(l.value.case));
              break;
          }
        },
        rpcAck: (l) => o.handleIncomingRpcAck(l.requestId)
      },
      room: {
        registerRpcMethod: (l, u) => a.registerRpcMethod(l, u),
        unregisterRpcMethod: (l) => a.unregisterRpcMethod(l)
      },
      localParticipant: {
        performRpc: (l) => o.performRpc(l).then((u) => {
          let h = L(u, 2);
          return h[0], h[1];
        })
      }
    };
  }
}, wv = {
  key: /* @__PURE__ */ Symbol("lk.extension.rpcLegacy"),
  requires: [xs],
  install(i, e) {
    const t = e.get(xs).room, n = t.registerRpcMethod, r = t.unregisterRpcMethod;
    return {
      localParticipant: {
        registerRpcMethod: n,
        unregisterRpcMethod: r
      }
    };
  }
}, Ev = {
  key: /* @__PURE__ */ Symbol("lk.extension.simulatedParticipants"),
  install(i, e) {
    return {
      room: {
        simulateParticipants: (t) => _v(i, e, t)
      }
    };
  }
};
function _v(i, e, t) {
  return m(this, void 0, void 0, function* () {
    var n, r, s, o;
    const a = Object.assign({
      audio: !0,
      video: !0,
      useRealTracks: !1
    }, t.publish), c = Object.assign({
      count: 9,
      audio: !1,
      video: !0,
      aspectRatios: [1.66, 1.7, 1.3]
    }, t.participants), d = i.localParticipant, l = d.trackLoggerOptions;
    if (e.simulateConnected(new Ji({
      sid: "RM_SIMULATED",
      name: "simulated-room",
      emptyTimeout: 0,
      maxParticipants: 0,
      creationTime: te.parse((/* @__PURE__ */ new Date()).getTime()),
      metadata: "",
      numParticipants: 1,
      numPublishers: 1,
      turnPassword: "",
      enabledCodecs: [],
      activeRecording: !1
    }), new Kt({
      identity: "simulated-local",
      name: "local-name"
    })), a.video) {
      const u = new _s(C.Kind.Video, new rn({
        source: de.CAMERA,
        sid: Math.floor(Math.random() * 1e4).toString(),
        type: Ke.AUDIO,
        name: "video-dummy"
      }), Fi().createTrack(a.useRealTracks && (!((n = window.navigator.mediaDevices) === null || n === void 0) && n.getUserMedia) ? (yield window.navigator.mediaDevices.getUserMedia({
        video: !0
      })).getVideoTracks()[0] : mo(160 * ((r = c.aspectRatios[0]) !== null && r !== void 0 ? r : 1), 160, !0, !0), void 0, !1, l), l);
      d.addTrackPublication(u), d.emit(x.LocalTrackPublished, u);
    }
    if (a.audio) {
      const u = new _s(C.Kind.Audio, new rn({
        source: de.MICROPHONE,
        sid: Math.floor(Math.random() * 1e4).toString(),
        type: Ke.AUDIO
      }), new sr(a.useRealTracks && (!((s = navigator.mediaDevices) === null || s === void 0) && s.getUserMedia) ? (yield navigator.mediaDevices.getUserMedia({
        audio: !0
      })).getAudioTracks()[0] : e.acquireEmptyAudioStreamTrack(), void 0, !1, d.audioContext, l), l);
      d.addTrackPublication(u), d.emit(x.LocalTrackPublished, u);
    }
    for (let u = 0; u < c.count - 1; u += 1) {
      let h = new Kt({
        sid: Math.floor(Math.random() * 1e4).toString(),
        identity: "simulated-".concat(u),
        state: on.ACTIVE,
        tracks: [],
        joinedAt: te.parse(Date.now())
      });
      const f = e.getOrCreateParticipant(h.identity, h);
      if (c.video) {
        const g = mo(160 * ((o = c.aspectRatios[u % c.aspectRatios.length]) !== null && o !== void 0 ? o : 1), 160, !1, !0), p = new rn({
          source: de.CAMERA,
          sid: Math.floor(Math.random() * 1e4).toString(),
          type: Ke.AUDIO
        });
        f.addSubscribedMediaTrack(g, p.sid, new MediaStream([g]), new RTCRtpReceiver()), h.tracks = [...h.tracks, p];
      }
      if (c.audio) {
        const g = e.acquireEmptyAudioStreamTrack(), p = new rn({
          source: de.MICROPHONE,
          sid: Math.floor(Math.random() * 1e4).toString(),
          type: Ke.AUDIO
        });
        f.addSubscribedMediaTrack(g, p.sid, new MediaStream([g]), new RTCRtpReceiver()), h.tracks = [...h.tracks, p];
      }
      f.updateInfo(h);
    }
  });
}
const Pv = [Hi, xs, wv, Cv, gv, mv, Gl, Ev, vv];
class Rv extends wn {
  /**
   * Creates a new Room, the primary construct for a LiveKit session.
   * @param options
   */
  constructor(e) {
    super(e), bl(this, Pv);
  }
}
wa();
const Jl = new URLSearchParams(location.search), $l = (Jl.get("v2_server") ?? "http://localhost:8790").replace(/\/+$/, ""), wt = () => window.Barn, Iv = `
.sl-launch{position:fixed;right:24px;bottom:24px;z-index:450;display:flex;align-items:center;gap:10px;padding:10px 18px 10px 10px;border:0;border-radius:999px;background:#111;color:#fff;font:500 15px/1 "Hanken Grotesk",system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.25)}
.sl-launch img{width:40px;height:40px;border-radius:50%;object-fit:cover}
body.sl-nobar .stylist{display:none!important}
body.sl-nobar{padding-right:0!important}
.sl-docked{border-radius:0}
.sl-docked .sl-center{padding:0 12px 64px;gap:6px}
.sl-docked .sl-face{width:96px}
.sl-docked .sl-name{font-size:18px}
.sl-docked .sl-caption{display:none}
.sl-docked .sl-self{top:10px;right:10px;width:96px}
.sl-docked .sl-bar{bottom:12px;gap:8px}
.sl-docked .sl-bar button{padding:8px 12px;font-size:12px}
.sl-stage{position:fixed;z-index:500;background:#0e0e10;color:#fff;font-family:"Hanken Grotesk",system-ui,sans-serif;transition:all .6s cubic-bezier(.2,.8,.2,1);overflow:hidden}
.sl-full{inset:0;border-radius:0}
.sl-corner{right:20px;bottom:20px;width:300px;height:330px;border-radius:20px;box-shadow:0 16px 50px rgba(0,0,0,.35)}
.sl-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:0 16px 120px}
.sl-corner .sl-center{padding:0 12px 84px;gap:8px}
.sl-face{position:relative;width:min(38vh,320px);aspect-ratio:1;border-radius:50%;transition:all .6s cubic-bezier(.2,.8,.2,1)}
.sl-corner .sl-face{width:120px}
.sl-face img{width:100%;height:100%;border-radius:50%;object-fit:cover;position:relative;z-index:1}
.sl-face::before{content:"";position:absolute;inset:-10px;border-radius:50%;background:radial-gradient(circle,rgba(255,196,140,.55),rgba(255,120,90,0) 70%);opacity:0;transform:scale(.9);transition:opacity .25s,transform .25s}
.sl-speaking .sl-face::before{opacity:1;transform:scale(1.12);animation:sl-pulse 1.1s ease-in-out infinite}
@keyframes sl-pulse{50%{transform:scale(1.2)}}
.sl-name{font:400 34px/1.1 Sentient,Georgia,serif;letter-spacing:-.01em}
.sl-corner .sl-name{font-size:20px}
.sl-status{font-size:14px;opacity:.65;min-height:1.2em}
.sl-caption{max-width:min(720px,92vw);text-align:center;font-size:20px;line-height:1.4;min-height:2.8em;opacity:.92}
.sl-corner .sl-caption{display:none}
.sl-self{position:absolute;top:20px;right:20px;width:220px;aspect-ratio:16/9;border-radius:14px;overflow:hidden;background:#222;box-shadow:0 6px 20px rgba(0,0,0,.4);transition:all .6s cubic-bezier(.2,.8,.2,1)}
.sl-corner .sl-self{top:12px;right:12px;width:92px}
.sl-self video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}
.sl-self span{position:absolute;left:8px;bottom:6px;font-size:11px;background:rgba(0,0,0,.5);padding:2px 6px;border-radius:6px}
.sl-bar{position:absolute;left:0;right:0;bottom:28px;display:flex;justify-content:center;gap:12px}
.sl-corner .sl-bar{bottom:14px;gap:8px}
.sl-bar button{border:0;border-radius:999px;padding:12px 20px;font:500 14px/1 "Hanken Grotesk",system-ui,sans-serif;cursor:pointer;background:#2a2a2e;color:#fff}
.sl-corner .sl-bar button{padding:9px 12px;font-size:12px}
.sl-bar .sl-end{background:#d6453d}
.sl-bar .sl-off{background:#fff;color:#111}
.sl-reveal{position:fixed;inset:0;z-index:600;display:flex;align-items:center;justify-content:center;background:rgba(10,10,12,.72);backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .4s}
.sl-reveal.sl-on{opacity:1;pointer-events:auto}
.sl-card{position:relative;background:#fff;color:#111;border-radius:22px;padding:18px;max-width:min(520px,92vw);box-shadow:0 30px 80px rgba(0,0,0,.4);transform:scale(.94);transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.sl-on .sl-card{transform:none}
.sl-card img{display:block;width:100%;max-height:72vh;object-fit:contain;border-radius:14px;background:#f4f4f4}
.sl-card h3{margin:14px 4px 2px;font:400 26px/1.1 Sentient,Georgia,serif}
.sl-card p{margin:0 4px;font-size:13px;opacity:.6}
.sl-card button{position:absolute;top:26px;right:26px;border:0;border-radius:999px;padding:8px 14px;background:rgba(0,0,0,.6);color:#fff;cursor:pointer}
.sl-loading{width:min(420px,80vw);aspect-ratio:3/4;border-radius:14px;background:linear-gradient(100deg,#eee 30%,#f8f8f8 50%,#eee 70%);background-size:300% 100%;animation:sl-shine 1.4s linear infinite}
@keyframes sl-shine{to{background-position:-150% 0}}
@media (max-width:640px){.sl-self{width:120px}.sl-corner{width:220px;height:280px}.sl-caption{font-size:17px}}
.sl-cursor{position:fixed;left:0;top:0;z-index:700;width:30px;height:30px;pointer-events:none;opacity:0;transition:transform .75s cubic-bezier(.3,.9,.3,1),opacity .3s;filter:drop-shadow(0 3px 6px rgba(0,0,0,.35))}
.sl-cursor.sl-on{opacity:1}
.sl-lens{position:fixed;left:0;top:0;z-index:695;width:118px;height:118px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px #d4664a,0 8px 22px rgba(0,0,0,.28);background-repeat:no-repeat;background-color:#f4f1ec;pointer-events:none;opacity:0;transform:scale(.6);transition:opacity .3s,transform .35s cubic-bezier(.3,.9,.3,1)}
.sl-lens.sl-on{opacity:1;transform:scale(1)}
.sl-lens i{position:absolute;left:50%;bottom:-30px;transform:translateX(-50%);font:600 11px/1 "Hanken Grotesk",system-ui,sans-serif;font-style:normal;background:#fff;color:#2a2420;padding:5px 8px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.18)}
.sl-cursor b{position:absolute;left:24px;top:22px;font:600 11px/1 "Hanken Grotesk",system-ui,sans-serif;background:#d4664a;color:#fff;padding:4px 7px;border-radius:999px;white-space:nowrap}
.sl-cursor.sl-press svg{transform:scale(.82);transition:transform .12s}
.sl-ring{position:fixed;z-index:690;pointer-events:none;border:2px solid #d4664a;border-radius:10px;box-shadow:0 0 0 5px rgba(212,102,74,.16);opacity:0;transition:all .45s cubic-bezier(.3,.9,.3,1)}
.sl-ring.sl-on{opacity:1}
.sl-ripple{position:fixed;z-index:695;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:2px solid #d4664a;pointer-events:none;animation:sl-rip .6s ease-out forwards}
@keyframes sl-rip{from{transform:scale(.3);opacity:1}to{transform:scale(1.6);opacity:0}}
.sl-pick-grid{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:var(--space-2xl,48px);padding-bottom:var(--space-3xl,64px);align-items:start}
.sl-pick-photo{position:relative;aspect-ratio:3/4;background:var(--tile,#f3f1ec);overflow:hidden}
.sl-pick-photo>img{width:100%;height:100%;object-fit:cover;animation:sl-in .8s ease}
@keyframes sl-in{from{opacity:0;transform:scale(1.03)}to{opacity:1;transform:none}}
.sl-pick-collage{display:grid;grid-template-columns:1fr 1fr;gap:2px;height:100%}
.sl-pick-collage img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply;background:var(--tile,#f3f1ec)}
.sl-pick-photo figcaption{position:absolute;left:12px;bottom:12px;font-size:12px;background:rgba(255,255,255,.85);padding:4px 8px;border-radius:6px}
.sl-pick-info{position:sticky;top:calc(var(--nav-h,64px) + 24px)}
.sl-pick-info h1{font-size:var(--text-3xl,40px);line-height:1.1;margin:4px 0 8px}
.sl-pick-intro{color:var(--color-ink-2,#444);margin:0 0 16px}
.sl-pick-item{grid-template-columns:64px 1fr auto!important;align-items:center}
.sl-pick-size{font-size:12px;color:var(--color-muted,#777)}
.sl-pick-item.sl-in-bag .sl-pick-size{color:#2f7d4f}
.sl-pick-total{display:flex;justify-content:space-between;padding-top:14px;margin-top:4px;border-top:1px solid var(--color-rule,#ddd);font-size:var(--text-lg,20px)}
.sl-pick-bag{margin-top:10px;font-size:14px;color:#2f7d4f;min-height:1.2em}
.sl-back{display:inline-block;margin-bottom:12px}
@media (max-width:820px){.sl-pick-grid{grid-template-columns:1fr}.sl-pick-info{position:static}}
`;
function Nt(i, e = "", t = "") {
  const n = document.createElement(i);
  return e && (n.className = e), t && (n.innerHTML = t), n;
}
document.head.append(Nt("style", "", Iv));
const Ql = new URL("./sasha-olivia.jpg", import.meta.url).href, ai = Nt("button", "sl-launch", `<img src="${Ql}" alt=""><span>Talk to Sasha</span>`);
ai.type = "button";
document.body.append(ai);
document.body.classList.add("sl-nobar");
document.getElementById("stylist-toggle")?.setAttribute("hidden", "");
const Yl = matchMedia("(min-width: 75rem)"), hc = document.getElementById("avatar-slot");
let se = null, me = null, ni = !1;
function _a() {
  if (!me || !ni) return;
  const i = Yl.matches && !!hc;
  if (document.body.classList.toggle("sl-nobar", !i), me.classList.toggle("sl-docked", i), me.classList.toggle("sl-corner", !i), !i) return me.removeAttribute("style");
  const e = hc.getBoundingClientRect();
  Object.assign(me.style, { top: `${e.top}px`, left: `${e.left}px`, width: `${e.width}px`, height: `${Math.max(e.height, 240)}px` });
}
addEventListener("resize", _a);
Yl.addEventListener("change", _a);
function Ze() {
  !me || ni || (ni = !0, me.classList.remove("sl-full"), document.body.classList.remove("sl-nobar"), requestAnimationFrame(_a));
}
function Kr(i) {
  me?.querySelector(".sl-status")?.replaceChildren(i);
}
const Pn = Nt("div", "sl-reveal", '<div class="sl-card"></div>');
document.body.append(Pn);
const fc = Pn.querySelector(".sl-card");
function pc(i) {
  fc.innerHTML = i.loading ? '<div class="sl-loading"></div><h3>Getting you dressed…</h3><p>One second.</p>' : `<img src="${i.url}" alt="You wearing ${i.title ?? "the look"}"><h3>${i.title ?? "Your look"}</h3><p>A preview made by AI from your camera. Fit and color may vary.</p><button type="button">Close</button>`, fc.querySelector("button")?.addEventListener("click", nt), Pn.classList.add("sl-on");
}
function nt() {
  Pn.classList.remove("sl-on");
}
Pn.addEventListener("click", (i) => {
  i.target === Pn && nt();
});
const gt = Nt("div", "sl-cursor", '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M4 2l16 9-7 2-3 7z" fill="#d4664a" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg><b>Sasha</b>'), ii = Nt("div", "sl-ring"), Et = Nt("div", "sl-lens", "<i></i>");
document.body.append(ii, Et, gt);
let mc;
async function Av(i) {
  const e = document.querySelector(".gal-main img");
  if (!e || !e.naturalWidth) return { ok: !1, error: "No product photo on screen" };
  const t = e.getBoundingClientRect();
  (t.top < 60 || t.bottom > innerHeight) && (oi(), e.scrollIntoView({ behavior: "smooth", block: "center" }), await Hn(500));
  const n = e.getBoundingClientRect(), r = Math.min(n.width / e.naturalWidth, n.height / e.naturalHeight), s = e.naturalWidth * r, o = e.naturalHeight * r, a = n.left + (n.width - s) / 2, c = n.top + (n.height - o) / 2, d = a + Math.max(0, Math.min(1e3, i.x)) / 1e3 * s, l = c + Math.max(0, Math.min(1e3, i.y)) / 1e3 * o;
  ii.classList.remove("sl-on"), ri = null, gt.style.transform = `translate(${d}px, ${l}px)`, gt.classList.add("sl-on");
  const u = 2.6, h = 118, f = d + 34 + h > innerWidth ? d - 34 - h : d + 34, g = Math.max(10, l - h - 10);
  return Object.assign(Et.style, {
    transform: "",
    left: `${f}px`,
    top: `${g}px`,
    backgroundImage: `url("${e.currentSrc || e.src}")`,
    backgroundSize: `${s * u}px ${o * u}px`,
    backgroundPosition: `${h / 2 - (d - a) * u}px ${h / 2 - (l - c) * u}px`
  }), Et.querySelector("i").textContent = i.detail ?? "", Et.querySelector("i").style.display = i.detail ? "" : "none", Et.classList.add("sl-on"), clearTimeout(mc), clearTimeout(Ki), mc = setTimeout(() => Et.classList.remove("sl-on"), 2600), Ki = setTimeout(() => gt.classList.remove("sl-on"), 6e3), { ok: !0 };
}
addEventListener("scroll", () => {
  Date.now() > Pa && Et.classList.remove("sl-on");
}, { passive: !0 });
let Ki, Ms = 0, Pa = 0, ri = null;
const oi = () => {
  Pa = Date.now() + 1500;
};
function Xl() {
  if (!ri) return;
  const i = ri.getBoundingClientRect();
  Object.assign(ii.style, { left: `${i.left - 6}px`, top: `${i.top - 6}px`, width: `${i.width + 12}px`, height: `${i.height + 12}px` });
}
const Hn = (i) => new Promise((e) => setTimeout(e, i)), Zl = {
  photo: ".sl-pick-photo, .gal-main",
  thumbnails: ".thumbs",
  title: ".sl-pick-info h1, .info h1",
  price: ".info .price",
  colors: '.chips[data-g="c"]',
  sizes: '.chips[data-g="s"]',
  description: ".desc p",
  details: ".desc ul",
  add_to_bag: "#bag",
  related: ".also",
  total: ".sl-pick-total, .board-total",
  pieces: ".sl-pick-list",
  bag: "#bag-open",
  looks: ".board-looks",
  heading: "main h1"
}, bi = (i) => i.toLowerCase().replace(/[^a-z0-9.]/g, "");
function Ra(i) {
  const [e, ...t] = i.split(":"), n = t.join(":").trim();
  if (e === "product")
    return document.querySelector(`.sl-pick-item[data-id="${n}"]`) ?? document.querySelector(`main a.card[href="#/product/${n}"], main .board-item a[href="#/product/${n}"]`)?.closest(".card, .board-item") ?? null;
  if (e === "look") return document.querySelectorAll(".board-look")[Number(n) - 1] ?? null;
  if (e === "photo" && n) return document.querySelector(`.thumbs button[data-i="${Number(n) - 1}"]`);
  if (e === "size" || e === "color") {
    const s = [...document.querySelectorAll(`.chips[data-g="${e[0]}"] .chip`)];
    return s.find((o) => bi(o.dataset.v ?? "") === bi(n)) ?? s.find((o) => bi(o.dataset.v ?? "").startsWith(bi(n))) ?? null;
  }
  const r = Zl[e];
  return r ? [...document.querySelectorAll(r)].find((s) => s.offsetParent !== null) ?? null : null;
}
function Ia() {
  const i = Object.keys(Zl).filter((e) => Ra(e));
  return document.querySelectorAll(".sl-pick-item, main a.card").forEach((e) => i.push(`product:${e.dataset.id ?? e.getAttribute("href")?.split("/").pop()}`)), document.querySelectorAll(".board-look").forEach((e, t) => i.push(`look:${t + 1}`)), document.querySelectorAll('.chips[data-g="s"] .chip:not([disabled])').forEach((e) => i.push(`size:${e.dataset.v}`)), document.querySelectorAll(".thumbs button").forEach((e, t) => i.push(`photo:${t + 1}`)), [...new Set(i)].slice(0, 40);
}
async function xv(i, e = !1) {
  const t = Ra(i);
  if (!t) return { ok: !1, error: `Nothing called "${i}" on this page`, available: Ia() };
  const n = t.getBoundingClientRect();
  (n.top < 70 || n.bottom > innerHeight - 20) && (oi(), t.scrollIntoView({ behavior: "smooth", block: "center" }), await Hn(550));
  const r = t.getBoundingClientRect(), s = r.left + Math.min(r.width / 2, 120), o = r.top + Math.min(r.height / 2, 90);
  if (gt.style.transform = `translate(${s}px, ${o}px)`, gt.classList.add("sl-on"), ri = t, Xl(), ii.classList.add("sl-on"), clearTimeout(Ki), Ki = setTimeout(() => {
    ii.classList.remove("sl-on"), gt.classList.remove("sl-on"), ri = null;
  }, 7e3), await Hn(800), e) {
    gt.classList.add("sl-press");
    const a = Nt("div", "sl-ripple");
    Object.assign(a.style, { left: `${s}px`, top: `${o}px` }), document.body.append(a), setTimeout(() => a.remove(), 700), await Hn(150), Ms++;
    try {
      (t.matches("a, button") ? t : t.querySelector("a, button") ?? t).click();
    } finally {
      setTimeout(() => Ms--, 50);
    }
    gt.classList.remove("sl-press");
  }
  return { ok: !0, pointed_at: i, clicked: e || void 0 };
}
addEventListener("scroll", Xl, { passive: !0 });
async function Mv(i) {
  if (oi(), i === "top") scrollTo({ top: 0, behavior: "smooth" });
  else if (i === "bottom") scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  else if (i === "down" || i === "up") scrollBy({ top: (i === "down" ? 1 : -1) * innerHeight * 0.7, behavior: "smooth" });
  else {
    const t = Ra(i);
    if (!t) return { ok: !1, error: `Nothing called "${i}" on this page`, available: Ia() };
    t.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  await Hn(600);
  const e = document.body.scrollHeight - innerHeight;
  return { ok: !0, at: e > 0 ? `${Math.round(scrollY / e * 100)}% down the page` : "the whole page fits on screen" };
}
let Jt = null;
function Ov(i) {
  Jt = { name: i.name, items: i.items };
  const e = i.items.map((n) => ({ ...n, p: byId[n.product_id] })).filter((n) => n.p), t = i.total_usd ?? e.reduce((n, r) => n + r.p.simulated.price, 0);
  return main.innerHTML = `<div class="container"><a class="link sl-back" href="#/stylist">← All three outfits</a>
    <div class="sl-pick-grid"><figure class="sl-pick-photo" style="margin:0"><div class="sl-pick-collage">${e.slice(0, 4).map((n) => `<img src="${img(n.p)}" alt="">`).join("")}</div></figure>
    <div class="sl-pick-info"><div class="brand">Your pick</div><h1>${esc(i.name)}</h1>${i.intro ? `<p class="sl-pick-intro">${esc(i.intro)}</p>` : ""}
    <ul class="board-items sl-pick-list">${e.map((n) => `<li class="board-item sl-pick-item" data-id="${n.p.id}"><a class="board-pic" href="#/product/${n.p.id}"><img src="${img(n.p)}" alt=""></a>
      <div><div class="board-slot">${esc(n.slot)}</div><a class="board-title" href="#/product/${n.p.id}">${esc(title(n.p.title))}</a><div class="card-brand">${esc(n.p.brand)}</div><div class="sl-pick-size"></div></div>${priceHtml(n.p)}</li>`).join("")}</ul>
    <div class="sl-pick-total"><span>Outfit total</span><span>${money(Math.round(t * 100) / 100)}</span></div><p class="sl-pick-bag" aria-live="polite"></p></div></div></div>`, main.querySelector(".sl-back").addEventListener("click", (n) => {
    n.preventDefault(), Jt = null, wt()?.showLooks(wt()?.lastLooks);
  }), oi(), scrollTo({ top: 0, behavior: "smooth" }), { ok: !0, pieces: e.length };
}
const Os = () => !!Jt && !!main.querySelector(".sl-pick-grid");
function gc(i) {
  const e = main.querySelector(".sl-pick-photo");
  return e ? (e.innerHTML = i ? `<img src="${i}" alt="You wearing ${esc(Jt?.name)}"><figcaption>A preview made by AI from your camera</figcaption>` : '<div class="sl-loading" style="width:100%;height:100%;border-radius:0"></div>', !0) : !1;
}
addEventListener("barn:bag", (i) => {
  if (!Os() || i.detail?.action !== "add") return;
  const e = main.querySelector(`.sl-pick-item[data-id="${i.detail.id}"]`);
  e && (e.classList.add("sl-in-bag"), e.querySelector(".sl-pick-size").textContent = `In your bag, size ${i.detail.size}`);
  const t = wt()?.getBag(), n = main.querySelector(".sl-pick-bag");
  n && t && (n.textContent = `Bag: ${t.count} ${t.count === 1 ? "item" : "items"}, ${money(t.total)}`);
});
addEventListener("hashchange", () => {
  Jt = null;
});
function Aa(i, e) {
  !se || Ms || se.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ kind: i, detail: e, hash: location.hash })), { reliable: !0, topic: "shopper-activity" }).catch(() => {
  });
}
document.addEventListener("click", (i) => {
  const e = i.target;
  if (!i.isTrusted || e.closest(".sl-stage, .sl-launch")) return;
  const t = e.closest("a, button, .chip, .card"), n = t ? (t.getAttribute("aria-label") || t.textContent || t.getAttribute("href") || "").replace(/\s+/g, " ").trim().slice(0, 80) : e.tagName.toLowerCase();
  Aa("click", n || (t?.getAttribute("href") ?? ""));
}, !0);
let vc;
addEventListener("scroll", (i) => {
  !i.isTrusted || Date.now() < Pa || (clearTimeout(vc), vc = setTimeout(() => {
    const e = document.body.scrollHeight - innerHeight;
    e > 0 && Aa("scroll", `${Math.round(scrollY / e * 100)}% down`);
  }, 1200));
}, { passive: !0 });
addEventListener("hashchange", () => Aa("page", location.hash || "#/"));
const xa = {
  show_products: (i) => (Ze(), nt(), wt()?.showIds(i.ids, i.heading)),
  open_product: (i) => (Ze(), nt(), wt()?.openProduct(i.id)),
  show_looks: (i) => (Ze(), nt(), wt()?.showLooks(i.result)),
  add_to_bag: (i) => wt()?.addToBag(i.id, i.size, i.color),
  get_bag: () => wt()?.getBag(),
  // The try-on goes into the picked outfit's page when that's showing; otherwise it pops up over the page.
  tryon_loading: (i) => (Ze(), Os() && Jt?.name === i.title && gc(null) || pc({ loading: !0 }), { ok: !0 }),
  tryon_show: (i) => {
    Ze();
    const e = `${$l}/tryon/${i.file}`;
    return Os() && Jt?.name === i.title && gc(e) ? (nt(), scrollTo({ top: 0, behavior: "smooth" })) : pc({ url: e, title: i.title }), { ok: !0 };
  },
  tryon_hide: () => (nt(), { ok: !0 }),
  show_pick: (i) => (Ze(), nt(), Ov(i)),
  point: (i) => (Ze(), xv(String(i.target), !!i.click)),
  scroll: (i) => (Ze(), Mv(String(i.to))),
  open_bag: () => (document.getElementById("bag-drawer")?.hidden && document.getElementById("bag-open")?.click(), { ok: !0 }),
  hover_photo: (i) => Av(i),
  where: () => ({ ok: !0, page: location.hash || "#/", targets: Ia() }),
  // Flip the product page's gallery to one photo (clicks its thumbnail, waiting for the page to render).
  show_photo: async (i) => {
    Ze(), nt(), Et.classList.remove("sl-on");
    for (let e = 0; e < 20; e++) {
      const t = document.querySelector(`.thumbs button[data-i="${i.index}"]`);
      if (t)
        return t.click(), oi(), document.querySelector(".gal")?.scrollIntoView({ behavior: "smooth", block: "center" }), { ok: !0 };
      await new Promise((n) => setTimeout(n, 100));
    }
    return { ok: !1, error: "The product page is not showing that photo" };
  }
};
Jl.has("sasha_debug") && (window.sashaDo = (i, e = {}) => xa[i]?.(e));
async function Lv(i) {
  try {
    const e = JSON.parse(i.payload), t = xa[e.action], n = t ? await t(e) : { ok: !1, error: `Unknown action ${e.action}` };
    return JSON.stringify(n ?? { ok: !1, error: "The store is not loaded" });
  } catch (e) {
    return JSON.stringify({ ok: !1, error: e.message });
  }
}
async function eu() {
  ai.hidden = !0, me = Nt("div", "sl-stage sl-full", `
    <div class="sl-center">
      <div class="sl-face"><img src="${Ql}" alt="Sasha"></div>
      <div class="sl-name">Sasha</div>
      <div class="sl-status">Connecting…</div>
      <div class="sl-caption" aria-live="polite"></div>
    </div>
    <div class="sl-self"><video autoplay muted playsinline></video><span>You</span></div>
    <div class="sl-bar"><button class="sl-mute" type="button">Mute</button><button class="sl-cam" type="button">Camera off</button><button class="sl-end" type="button">End call</button></div>`), document.body.append(me), ni = !1, me.querySelector(".sl-end").addEventListener("click", Ls);
  try {
    const { url: i, token: e } = await (await fetch(`${$l}/token`)).json();
    se = new Rv({ adaptiveStream: !0, dynacast: !0 }), se.registerRpcMethod("barn", Lv), se.on(_.TrackSubscribed, (a) => {
      a.kind === C.Kind.Audio && document.body.append(Object.assign(a.attach(), { className: "sl-audio" }));
    }), se.on(_.ActiveSpeakersChanged, (a) => {
      const c = a.some((d) => d.identity !== se?.localParticipant.identity);
      me?.classList.toggle("sl-speaking", c);
    }), se.on(_.ParticipantConnected, () => {
      se?.localParticipant.isCameraEnabled !== !1 && Kr("Here with you");
    }), se.on(_.Disconnected, () => Ls()), se.registerTextStreamHandler("lk.transcription", async (a, c) => {
      if (c.identity === se?.localParticipant.identity) return;
      const d = me?.querySelector(".sl-caption");
      if (d) {
        d.textContent = "";
        for await (const l of a) d.textContent += l;
      }
    }), await se.connect(i, e);
    const t = { echoCancellation: !0, noiseSuppression: !0 }, n = await Cn({ audio: t, video: { resolution: { width: 1280, height: 720 } } }).catch(() => Cn({ audio: t })).catch(() => {
      throw new Error("the browser blocked the microphone. Allow it in the address bar and try again");
    });
    for (const a of n) await se.localParticipant.publishTrack(a);
    const r = n.find((a) => a.kind === C.Kind.Video);
    r && r.attach(me.querySelector(".sl-self video")), Kr(r ? se.remoteParticipants.size ? "Here with you" : "Sasha is joining…" : "Voice only: your camera is off or blocked");
    const s = me.querySelector(".sl-mute");
    s.addEventListener("click", async () => {
      const a = se.localParticipant.isMicrophoneEnabled;
      await se.localParticipant.setMicrophoneEnabled(!a), s.textContent = a ? "Unmute" : "Mute", s.classList.toggle("sl-off", a);
    });
    const o = me.querySelector(".sl-cam");
    o.addEventListener("click", async () => {
      const a = se.localParticipant.isCameraEnabled;
      await se.localParticipant.setCameraEnabled(!a), o.textContent = a ? "Camera on" : "Camera off", o.classList.toggle("sl-off", a);
    });
  } catch (i) {
    console.error("[sasha-live]", i), Kr(i instanceof TypeError ? "Couldn't reach Sasha's server. Is v2/server.ts running?" : `Couldn't start: ${i.message}.`);
  }
}
async function Ls() {
  const i = se;
  se = null, await i?.disconnect().catch(() => {
  }), document.querySelectorAll(".sl-audio").forEach((e) => e.remove()), me?.remove(), me = null, nt(), ai.hidden = !1, document.body.classList.add("sl-nobar"), ni = !1;
}
ai.addEventListener("click", eu);
window.SashaLive = { start: eu, end: Ls, shrink: Ze, actions: xa };

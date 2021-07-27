// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { EMessageDirection } from './message-node'

export interface INPSMessageJSON {
  packetName: string
  msgNo: number
  opCode: number | undefined
  msgLength: number
  msgVersion: number
  content: string
  contextId: string
  direction: EMessageDirection
  sessionkey: string | undefined
  rawBuffer: string
}

/*
    NPS messages are sent serialized in BE format
*/

// WORD msgNo;    NPS message number

/**
 * @class
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {MESSAGE_DIRECTION} direction
 */
export class NPSMessage {
  msgNo: number
  msgVersion: number
  reserved: number
  content: Buffer
  msgLength: number
  direction: EMessageDirection
  serviceName: string
  packetName: string
  /**
   *
   * @param {module:MessageNode.MESSAGE_DIRECTION} direction - the direction of the message flow
   */
  constructor(direction: EMessageDirection, packetName?: string) {
    this.packetName = 'NPSMessage'
    if (packetName) {
      this.packetName = this.packetName.concat(':', packetName)
    }
    this.msgNo = 0
    this.msgVersion = 0
    this.reserved = 0
    this.content = Buffer.from([0x01, 0x02, 0x03, 0x04])
    this.msgLength = this.content.length + 12
    this.direction = direction
    this.serviceName = 'mcoserver:NPSMsg'
  }

  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  setContent(buffer: Buffer): void {
    this.content = buffer
    this.msgLength = this.content.length + 12
  }

  /**
   *
   * @return {Buffer}
   */
  getContentAsBuffer(): Buffer {
    return this.content
  }

  /**
   *
   * @return {string}
   */
  getPacketAsString(): string {
    return this.serialize().toString('hex')
  }

  /**
   *
   * @return {Buffer}
   */
  serialize(): Buffer {
    try {
      const packet = Buffer.alloc(this.msgLength)
      packet.writeInt16BE(this.msgNo, 0)
      packet.writeInt16BE(this.msgLength, 2)
      if (this.msgLength > 4) {
        packet.writeInt16BE(this.msgVersion, 4)
        packet.writeInt16BE(this.reserved, 6)
      }

      if (this.msgLength > 8) {
        packet.writeInt32BE(this.msgLength, 8)
        this.content.copy(packet, 12)
      }

      return packet
    } catch (error) {
      if (error instanceof Error) {
        throw new TypeError(`[NPSMsg] Error in serialize(): ${error}`)
      }

      throw new Error('[NPSMsg] Error in serialize(), error unknown')
    }
  }

  /**
   *
   * @param {Buffer} packet
   * @return {NPSMsg}
   * @memberof NPSMsg
   */
  deserialize(packet: Buffer): NPSMessage {
    this.msgNo = packet.readInt16BE(0)
    this.msgLength = packet.readInt16BE(2)
    this.msgVersion = packet.readInt16BE(4)
    this.content = packet.slice(12)
    return this
  }

  /**
   *
   * @return {INPSMsgJSON}
   */
  toJSON(): INPSMessageJSON {
    return {
      packetName: this.packetName,
      msgNo: this.msgNo,
      contextId: '',
      msgLength: this.msgLength,
      msgVersion: this.msgVersion,
      content: this.content.toString('hex'),
      direction: this.direction,
      rawBuffer: this.content.toString('hex'),
      opCode: 0,
      sessionkey: '',
    }
  }
}

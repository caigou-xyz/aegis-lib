import { Signature } from 'ethers'
import nacl from 'tweetnacl'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AegisClient } from '../src/client'

describe('aegisClient', () => {
  let client: AegisClient
  let keyPair: nacl.SignKeyPair

  beforeEach(() => {
    keyPair = nacl.sign.keyPair()
    client = new AegisClient({
      endpoint: 'http://localhost:8080',
      signKeyPair: keyPair,
    })

    // Mock fetch globally
    globalThis.fetch = vi.fn()
  })

  describe('ping', () => {
    it('should return pong', async () => {
      mockFetchResponse('pong')
      const result = await client.ping()
      expect(result).toBe('pong')
    })
  })

  const mockEVMAccounts = [
    '0x311b450D1c94b266c6abe97fABDDaDA4C0A2c67E',
    '0xdc2756205d4b89D01D6Cf1C3ebD8746fe00e47bb',
    '0xa8Fe07F64B11BBfe743F11e6F6943D1A6ED5A473',
    '0x3f1AD4675779d1a10838d66DF987EE48193231AF',
    '0x3Ebf319A13e1ac04C6c6D49E3df7aaE921124FcE',
    '0x5d7969A8C1EF9495E4dA7c622D34985E06f40504',
    '0x228fc100CdfB5F6cEfa82602d3CD5078050B2b7B',
    '0x3d6d66513737137f455f672dab7a7CF0F437dB63',
    '0x808465085eb79dAb8f3320Cf8F2b43d946C26C8e',
    '0x93F08e98910A963CE24177F06990C7D8aA97c21c',
  ]

  describe('eVM Module', () => {
    it('should add EVM accounts', async () => {
      const mockResponse = {
        message: '',
        addresses: mockEVMAccounts,
      }

      mockFetchResponse(mockResponse)

      const result = await client.addEVMAccounts(2)
      expect(result.addresses).toEqual(mockEVMAccounts)
    })

    it('should get EVM accounts', async () => {
      const mockResponse = {
        message: '',
        addresses: mockEVMAccounts,
      }

      mockFetchResponse(mockResponse)

      const result = await client.getEVMAccounts()
      expect(result.addresses).toEqual(mockEVMAccounts)
    })

    it('should sign EVM message', async () => {
      const mockResponse = {
        message: '',
        signature: 'cffbd3d5811ee690a89add65a106e2701f687a4cfd7e601f4d0abf37e13122003bd37cae618bdfea0f1ed2292716f686b2a56aadafc025be71f82df0834ff6f601',
      }
      mockFetchResponse(mockResponse)

      const result = await client.signEVM('0x123', '0x')
      expect(result).toBeInstanceOf(Signature)
    })
  })

  const mockTonAccounts = [
    { address: '0:b34af6438f6ae695972012479b75602bdfb09168c38761a7913493e9db728728', version: 9, public_key_hex: '18a3539dc4be44cadaede832770f9a179f9b45b2391b8600275aa3017f237c34' },
    { address: '0:fefa88334540d1d4654bec05ce7b4967faa5a6635feab8734f4d037c5a1a54b7', version: 9, public_key_hex: 'b657f847656a40b9c72021a94c936c43a50f5b35fa396f129ebd54ca003e22e3' },
    { address: '0:161b6df8c5c9aadf0bf6b965befa8f9f517461924cf163471105a0b8e32f5b09', version: 9, public_key_hex: 'bdc4b2ca5142e2798209d69b1ee6937341ba446d4f031a7ed0a5aaa94992009d' },
    { address: '0:49f93193aeae177a89c038aa6a82e7c7137f6e351e2c13ce9731550aeed3a6f3', version: 9, public_key_hex: '5be5f73a9fa56fc1abc70361c46f6651d53c3114388f9353ea50edc5f1901312' },
    { address: '0:d9ff77f11858c060baaa0e515627ab45e8f0c6c6ea3055b49c02d574352e8077', version: 9, public_key_hex: '7777d2c2076623914a8ba45ed4d829c3e081994a222f1b6f54f3632e4aae6d41' },
  ]

  describe('tON Module', () => {
    it('should add TON accounts', async () => {
      const mockResponse = {
        message: '',
        accounts: mockTonAccounts,
      }
      mockFetchResponse(mockResponse)

      const result = await client.addTONAccounts(2)
      expect(result.accounts).toEqual(mockTonAccounts)
    })

    it('should get TON accounts', async () => {
      const mockResponse = {
        message: '',
        accounts: mockTonAccounts,
      }
      mockFetchResponse(mockResponse)

      const result = await client.getTONAccounts()
      expect(result.accounts).toEqual(mockTonAccounts)
    })

    it('should sign TON message', async () => {
      const mockResponse = {
        message: '',
        signature: '1e7e66657e5e56dc070c0fe24775353b4686cb721b6e6b1a1fab2040217e288ccfd2ba86b71f881d31f0d165f57a223b0592bea280a45d1b0b9eb1259f01fe0f',
      }
      mockFetchResponse(mockResponse)

      const result = await client.signTON('ton1', 'test message')
      expect(result.signature).toBe('1e7e66657e5e56dc070c0fe24775353b4686cb721b6e6b1a1fab2040217e288ccfd2ba86b71f881d31f0d165f57a223b0592bea280a45d1b0b9eb1259f01fe0f')
    })
  })

  describe('error handling', () => {
    it('should throw error on non-ok response', async () => {
      mockFetchErrorResponse(400)
      await expect(client.ping()).rejects.toThrow('HTTP error! status: 400')
    })
  })
})

function mockFetchResponse(response: any) {
  ;(globalThis.fetch as any).mockResolvedValueOnce({
    ok: true,
    json: async () => response,
  })
}

function mockFetchErrorResponse(status: number) {
  ;(globalThis.fetch as any).mockResolvedValueOnce({
    ok: false,
    status,
  })
}

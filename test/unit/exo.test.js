const { priceWithTax, convertPrice } = require('../../src/exo');

describe('priceWithTax', () => {
  it('should calculate price with 20% tax for FR', () => {
    expect(priceWithTax(100, 'FR')).toBe('120.00');
  });

  it('should calculate price with 19% tax for DE', () => {
    expect(priceWithTax(100, 'DE')).toBe('119.00');
  });

  it('should calculate price with 0% tax for US', () => {
    expect(priceWithTax(100, 'US')).toBe('100.00');
  });

  it('should default to 20% tax for unknown country', () => {
    expect(priceWithTax(100, 'JP')).toBe('120.00');
  });

  it('should handle price of 0', () => {
    expect(priceWithTax(0, 'FR')).toBe('0.00');
  });

  it('should handle decimal prices', () => {
    expect(priceWithTax(99.99, 'DE')).toBe('118.99');
  });
});

describe('convertPrice', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should convert price using exchange rate API', async () => {
    const mockResponse = { result: 0.85 };
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse)
    });

    const result = await convertPrice(100, 'USD', 'EUR');
    expect(result).toBe('85.00');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.exchangerate.host/convert?from=USD&to=EUR'
    );
  });

  it('should handle decimal conversion rates', async () => {
    const mockResponse = { result: 1.18 };
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse)
    });

    const result = await convertPrice(50, 'EUR', 'USD');
    expect(result).toBe('59.00');
  });

  it('should handle API error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(convertPrice(100, 'USD', 'EUR')).rejects.toThrow('Network error');
  });

  it('should handle invalid JSON response', async () => {
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON'))
    });

    await expect(convertPrice(100, 'USD', 'EUR')).rejects.toThrow('Invalid JSON');
  });
});

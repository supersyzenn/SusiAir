import { corsOrigins } from '../src/common/cors-origins';

describe('local browser origins',()=>{
  it('accepts equivalent local addresses on the configured frontend port during development',()=>{
    expect(corsOrigins('http://localhost:3000','development')).toEqual(expect.arrayContaining([
      'http://localhost:3000','http://127.0.0.1:3000','http://0.0.0.0:3000',
    ]));
    expect(corsOrigins('http://localhost:3000','development')).not.toContain('http://localhost:3002');
  });
  it('keeps production origins explicit',()=>{
    expect(corsOrigins('http://localhost:3000, https://pilot.example.com','production')).toEqual([
      'http://localhost:3000','https://pilot.example.com',
    ]);
  });
  it('does not expand external origins or permit arbitrary LAN addresses',()=>{
    expect(corsOrigins('https://pilot.example.com','development')).toEqual(['https://pilot.example.com']);
    expect(corsOrigins('http://localhost:3000','development')).not.toContain('http://192.168.1.22:3000');
  });
});

import { RoleBadgePipe } from './role-badge.pipe';

describe('RoleBadgePipe', () => {
  const pipe = new RoleBadgePipe();

  it('gives Admin a green pill', () => {
    expect(pipe.transform('Admin')).toContain('bg-green-100');
  });

  it('gives General User a blue pill', () => {
    expect(pipe.transform('General User')).toContain('bg-blue-100');
  });
});

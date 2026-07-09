import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '../DropdownMenu';

const DropdownWithState = ({ onEmailSelect = vi.fn() }) => {
  const [showGrid, setShowGrid] = React.useState(false);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Buka Menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Menu Saya</DropdownMenuLabel>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
          Tampilkan Grid
        </DropdownMenuCheckboxItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Bagikan</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={onEmailSelect}>Email</DropdownMenuItem>
            <DropdownMenuItem>SMS</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

describe('Dropdown Menu Component Testing', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    cleanup();
  });

  it('should open menu, show items, and close when item is clicked', async () => {
    const onSelectMock = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Buka</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelectMock}>Hapus</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole('button', { name: /buka/i });
    await user.click(trigger);

    const menuItem = await screen.findByRole('menuitem', { name: /hapus/i });
    expect(menuItem).toBeInTheDocument();

    await user.click(menuItem);
    expect(onSelectMock).toHaveBeenCalledTimes(1);
  });

  it('should correctly toggle a CheckboxItem', async () => {
    render(<DropdownWithState />);

    await user.click(screen.getByRole('button', { name: /buka menu/i }));
    const checkboxItem = await screen.findByRole('menuitemcheckbox', {
      name: /tampilkan grid/i,
    });
    expect(checkboxItem).toHaveAttribute('aria-checked', 'false');

    await user.click(checkboxItem);
    expect(checkboxItem).toHaveAttribute('aria-checked', 'true');
  });

  // it("should open a sub-menu and click a sub-item", async () => {
  //   const onEmailSelectMock = vi.fn();
  //   render(<DropdownWithState onEmailSelect={onEmailSelectMock} />);

  //   await user.click(screen.getByRole("button", { name: /buka menu/i }));

  //   const subTrigger = await screen.findByRole("menuitem", {
  //     name: /bagikan/i,
  //   });
  //   await user.hover(subTrigger);

  //   const subMenuItem = await screen.findByRole("menuitem", { name: /email/i });
  //   await user.click(subMenuItem);

  //   expect(onEmailSelectMock).toHaveBeenCalledTimes(1);
  // });
});

import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import React from "react";

const meta = {
    title: 'Card',
    component: Card,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Test default',
        border: 'none',
        strikethrough: false,
        icon: '#trash-2',
        children: [
            <div>
                <strong>VPO-SI</strong>
                <br />
                <small className="text-muted">Cosec: Tonfio Caval, Ivo Steiner</small>
                <br />
                <small className="text-muted">Prof: Lorezo Ciccio</small>
            </div>
        ]
    },
};

export const New: Story = {
    args: {
        title: 'Test new',
        border: 'dashed',
        strikethrough: false,
        icon: '#trash-2',
        children: [
            <div>
                <strong>VPO-SI</strong>
                <br />
                <small className="text-muted">Cosec: Tonfio Caval, Ivo Steiner</small>
                <br />
                <small className="text-muted">Prof: Lorezo Ciccio</small>
            </div>
        ]
    },
};

export const Deleted: Story = {
    args: {
        title: 'Test deleted',
        border: 'solid',
        strikethrough: true,
        icon: '#rotate-ccw',
        children: [
            <div>
                <strong>VPO-SI</strong>
                <br />
                <small className="text-muted">Cosec: Tonfio Caval, Ivo Steiner</small>
                <br />
                <small className="text-muted">Prof: Lorezo Ciccio</small>
            </div>
        ]
    },
};

export const WithoutChildren: Story = {
    args: {
        title: 'Test short',
        border: 'none',
        strikethrough: false,
        icon: '#trash-2'
    },
};

export const WithoutIcon: Story = {
    args: {
        title: 'Test no icon',
        border: 'none',
        strikethrough: false,
        children: [
            <div>
                <strong>VPO-SI</strong>
                <br />
                <small className="text-muted">Cosec: Tonfio Caval, Ivo Steiner</small>
                <br />
                <small className="text-muted">Prof: Lorezo Ciccio</small>
            </div>
        ]
    },
};

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  ArrowLeft,
  ExternalLink,
  ShoppingBag,
  AlertCircle,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/merch/cart-context';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: {
    size?: string;
    color?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  items: OrderItem[];
  shippingName?: string;
  shippingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  trackingNumber?: string;
  trackingCarrier?: string;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Pending', color: 'text-yellow-400', icon: Clock },
  PAID: { label: 'Paid', color: 'text-green-400', icon: CheckCircle },
  PROCESSING: { label: 'Processing', color: 'text-blue-400', icon: Package },
  SHIPPED: { label: 'Shipped', color: 'text-purple-400', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'text-green-400', icon: CheckCircle },
  CANCELED: { label: 'Canceled', color: 'text-red-400', icon: AlertCircle },
  REFUNDED: { label: 'Refunded', color: 'text-orange-400', icon: AlertCircle },
};

function OrderCard({ order }: { order: Order }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div layout className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      {/* Order Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
            <ShoppingBag className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{order.orderNumber}</span>
              <span className={`flex items-center gap-1 text-sm ${statusConfig.color}`}>
                <StatusIcon className="h-4 w-4" />
                {statusConfig.label}
              </span>
            </div>
            <p className="text-sm text-white/50">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-white">
            {formatPrice(order.total, order.currency.toUpperCase())}
          </p>
          <p className="text-sm text-white/50">
            {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
          </p>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-white/10"
        >
          {/* Order Items */}
          <div className="p-6">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
              Items
            </h4>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl bg-white/5 p-4"
                >
                  <div>
                    <p className="font-medium text-white">{item.name}</p>
                    {item.variant && (
                      <p className="text-xs text-white/50">
                        {item.variant.size && `Size: ${item.variant.size}`}
                        {item.variant.size && item.variant.color && ' / '}
                        {item.variant.color && `Color: ${item.variant.color}`}
                      </p>
                    )}
                    <p className="text-sm text-white/50">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-white">
                    {formatPrice(item.totalPrice, order.currency.toUpperCase())}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-white/10 p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/70">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal, order.currency.toUpperCase())}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Shipping</span>
                <span>
                  {order.shippingCost === 0
                    ? 'FREE'
                    : formatPrice(order.shippingCost, order.currency.toUpperCase())}
                </span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Tax</span>
                <span>{formatPrice(order.tax, order.currency.toUpperCase())}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 font-semibold text-white">
                <span>Total</span>
                <span>{formatPrice(order.total, order.currency.toUpperCase())}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          {order.shippingAddress && (
            <div className="border-t border-white/10 p-6">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
                Shipping Address
              </h4>
              <p className="text-white">{order.shippingName}</p>
              <p className="text-white/70">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && (
                <p className="text-white/70">{order.shippingAddress.line2}</p>
              )}
              <p className="text-white/70">
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postal_code}
              </p>
              <p className="text-white/70">{order.shippingAddress.country}</p>

              {/* Tracking */}
              {order.trackingNumber && (
                <div className="mt-4 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-white/50" />
                  <span className="text-sm text-white/70">
                    Tracking: {order.trackingNumber}
                    {order.trackingCarrier && ` (${order.trackingCarrier})`}
                  </span>
                  <ExternalLink className="h-3 w-3 text-orange-400" />
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="border-t border-white/10 p-6">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
              Order Timeline
            </h4>
            <div className="space-y-3">
              <TimelineItem label="Order Placed" date={order.createdAt} completed={true} />
              <TimelineItem
                label="Payment Received"
                date={order.paidAt}
                completed={!!order.paidAt}
              />
              <TimelineItem label="Shipped" date={order.shippedAt} completed={!!order.shippedAt} />
              <TimelineItem
                label="Delivered"
                date={order.deliveredAt}
                completed={!!order.deliveredAt}
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function TimelineItem({
  label,
  date,
  completed,
}: {
  label: string;
  date?: string;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full ${
          completed ? 'bg-green-500/20' : 'bg-white/10'
        }`}
      >
        {completed ? (
          <CheckCircle className="h-4 w-4 text-green-400" />
        ) : (
          <div className="h-2 w-2 rounded-full bg-white/30" />
        )}
      </div>
      <div className="flex-1">
        <span className={completed ? 'text-white' : 'text-white/40'}>{label}</span>
      </div>
      {date && (
        <span className="text-sm text-white/50">
          {new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
      )}
    </div>
  );
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/merch/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, []);

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Link
            href="/merch"
            className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to store
          </Link>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
              <Package className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Order History</h1>
              <p className="text-white/50">Track your RNRB merch orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-8 w-8 rounded-full border-2 border-orange-500 border-t-transparent"
            />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
              <ShoppingBag className="h-10 w-10 text-white/30" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-white">No orders yet</h2>
            <p className="mb-6 text-white/50">
              Your order history will appear here after you make a purchase
            </p>
            <Link href="/merch">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white"
              >
                Browse Merch
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <OrderCard order={order} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

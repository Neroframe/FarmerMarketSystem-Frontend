import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="(buyer)/login" />
        <Stack.Screen name="(buyer)/register" />
        <Stack.Screen name="(buyer)/home" />
        <Stack.Screen name="(buyer)/product/[id]" />
        <Stack.Screen name="(buyer)/cart" />
        <Stack.Screen name="(buyer)/checkout" />



        <Stack.Screen name="(farmer)/login" />
        <Stack.Screen name="(farmer)/register" />
        <Stack.Screen name="(farmer)/dashboard" />
        <Stack.Screen name="(farmer)/products/index" />
        <Stack.Screen name="(farmer)/products/add" />
        <Stack.Screen name="(farmer)/products/edit/[id]" />
        {/* <Stack.Screen name="(farmer)/sales" /> */}
        {/* <Stack.Screen name="(farmer)/logout" /> */}
        <Stack.Screen name="+not-found" />
      </Stack>
  );
}

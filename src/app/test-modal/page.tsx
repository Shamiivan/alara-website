"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useModal
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ModalTestPage() {
  // Different modal instances for testing
  const basicModal = useModal();
  const smallModal = useModal();
  const largeModal = useModal();
  const fullModal = useModal();
  const noBackdropModal = useModal();
  const noEscapeModal = useModal();
  const customModal = useModal();
  const nestedModal = useModal();
  const [formData, setFormData] = React.useState({ name: "", email: "" });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Form submitted: ${JSON.stringify(formData)}`);
    customModal.closeModal();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Modal Component Test Suite</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Basic Modal Test */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Modal</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={basicModal.openModal} data-testid="basic-modal-trigger">
                Open Basic Modal
              </Button>
            </CardContent>
          </Card>

          {/* Size Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Small Modal</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={smallModal.openModal} variant="outline" data-testid="small-modal-trigger">
                Open Small Modal
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Large Modal</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={largeModal.openModal} variant="secondary" data-testid="large-modal-trigger">
                Open Large Modal
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Full Screen Modal</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={fullModal.openModal} variant="destructive" data-testid="full-modal-trigger">
                Open Full Modal
              </Button>
            </CardContent>
          </Card>

          {/* Behavior Tests */}
          <Card>
            <CardHeader>
              <CardTitle>No Backdrop Close</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={noBackdropModal.openModal} data-testid="no-backdrop-modal-trigger">
                No Backdrop Close
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>No Escape Close</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={noEscapeModal.openModal} data-testid="no-escape-modal-trigger">
                No Escape Close
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Form Modal</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={customModal.openModal} data-testid="custom-modal-trigger">
                Open Form Modal
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nested Modals</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={nestedModal.openModal} data-testid="nested-modal-trigger">
                Open Nested Modal
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Basic Modal */}
        <Modal
          open={basicModal.isOpen}
          onOpenChange={basicModal.setIsOpen}
          data-testid="basic-modal"
        >
          <ModalContent>
            <ModalHeader>
              <h2 className="text-xl font-semibold">Basic Modal</h2>
              <ModalCloseButton onClose={basicModal.closeModal} data-testid="basic-modal-close" />
            </ModalHeader>
            <ModalBody>
              <p className="mb-4">This is a basic modal with standard functionality.</p>
              <p>You can close it by:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Clicking the X button</li>
                <li>Pressing the Escape key</li>
                <li>Clicking outside the modal</li>
                <li>Using the Close button below</li>
              </ul>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={basicModal.closeModal} data-testid="basic-modal-cancel">
                Cancel
              </Button>
              <Button onClick={basicModal.closeModal} data-testid="basic-modal-ok">
                OK
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Small Modal */}
        <Modal
          open={smallModal.isOpen}
          onOpenChange={smallModal.setIsOpen}
          size="sm"
          data-testid="small-modal"
        >
          <ModalContent>
            <ModalHeader>
              <h2 className="text-lg font-semibold">Small Modal</h2>
              <ModalCloseButton onClose={smallModal.closeModal} />
            </ModalHeader>
            <ModalBody>
              <p>This is a small modal (max-width: 24rem).</p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={smallModal.closeModal} size="sm">Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Large Modal */}
        <Modal
          open={largeModal.isOpen}
          onOpenChange={largeModal.setIsOpen}
          size="lg"
          data-testid="large-modal"
        >
          <ModalContent>
            <ModalHeader>
              <h2 className="text-2xl font-semibold">Large Modal</h2>
              <ModalCloseButton onClose={largeModal.closeModal} />
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <p>This is a large modal (max-width: 32rem) with more content.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">Feature 1</h3>
                    <p className="text-sm text-muted-foreground">
                      Description of feature 1 with some additional details.
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">Feature 2</h3>
                    <p className="text-sm text-muted-foreground">
                      Description of feature 2 with some additional details.
                    </p>
                  </div>
                </div>
                <p>
                  Large modals are great for complex forms, detailed information,
                  or when you need more space for your content.
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={largeModal.closeModal}>
                Cancel
              </Button>
              <Button onClick={largeModal.closeModal}>
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Full Screen Modal */}
        <Modal
          open={fullModal.isOpen}
          onOpenChange={fullModal.setIsOpen}
          size="full"
          data-testid="full-modal"
        >
          <ModalContent>
            <ModalHeader>
              <h2 className="text-3xl font-bold">Full Screen Modal</h2>
              <ModalCloseButton onClose={fullModal.closeModal} />
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                <p className="text-lg">
                  This modal takes up the entire screen, perfect for immersive experiences.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="p-6 border rounded-lg">
                      <h3 className="font-semibold mb-2">Section {i}</h3>
                      <p className="text-muted-foreground">
                        This is section {i} with some example content to demonstrate
                        how full-screen modals can accommodate lots of information.
                      </p>
                    </div>
                  ))}
                </div>
                <p>
                  Full screen modals are ideal for complex workflows, detailed forms,
                  or when you need maximum space for content.
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button onClick={fullModal.closeModal} size="lg">
                Close Full Screen
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* No Backdrop Close Modal */}
        <Modal
          open={noBackdropModal.isOpen}
          onOpenChange={noBackdropModal.setIsOpen}
          closeOnBackdropClick={false}
          data-testid="no-backdrop-modal"
        >
          <ModalContent>
            <ModalHeader>
              <h2 className="text-xl font-semibold">No Backdrop Close</h2>
              <ModalCloseButton onClose={noBackdropModal.closeModal} />
            </ModalHeader>
            <ModalBody>
              <p>
                This modal cannot be closed by clicking outside of it.
                You must use the X button, Escape key, or the buttons below.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={noBackdropModal.closeModal}>
                Close Modal
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* No Escape Close Modal */}
        <Modal
          open={noEscapeModal.isOpen}
          onOpenChange={noEscapeModal.setIsOpen}
          closeOnEscape={false}
          data-testid="no-escape-modal"
        >
          <ModalContent>
            <ModalHeader>
              <h2 className="text-xl font-semibold">No Escape Close</h2>
              <ModalCloseButton onClose={noEscapeModal.closeModal} />
            </ModalHeader>
            <ModalBody>
              <p>
                This modal cannot be closed using the Escape key.
                Try pressing Escape - it won&apos;t work! You can still click outside or use buttons.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={noEscapeModal.closeModal}>
                Close Modal
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Custom Form Modal */}
        <Modal
          open={customModal.isOpen}
          onOpenChange={customModal.setIsOpen}
          size="lg"
          data-testid="custom-modal"
        >
          <ModalContent>
            <form onSubmit={handleFormSubmit}>
              <ModalHeader>
                <h2 className="text-xl font-semibold">Contact Form</h2>
                <ModalCloseButton onClose={customModal.closeModal} />
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter your name"
                      data-testid="form-name-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter your email"
                      data-testid="form-email-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter your message"
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button type="button" variant="outline" onClick={customModal.closeModal}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="form-submit-button">
                  Send Message
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Nested Modal */}
        <Modal
          open={nestedModal.isOpen}
          onOpenChange={nestedModal.setIsOpen}
          data-testid="nested-modal"
        >
          <ModalContent>
            <ModalHeader>
              <h2 className="text-xl font-semibold">Parent Modal</h2>
              <ModalCloseButton onClose={nestedModal.closeModal} />
            </ModalHeader>
            <ModalBody>
              <p className="mb-4">
                This is the parent modal. You can open a child modal from here.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Note: The child modal will appear on top of this one.
              </p>
              <Button onClick={basicModal.openModal} data-testid="nested-child-trigger">
                Open Child Modal
              </Button>
            </ModalBody>
            <ModalFooter>
              <Button onClick={nestedModal.closeModal}>
                Close Parent Modal
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Test Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Automated Testing</h3>
                <p className="text-sm text-muted-foreground">
                  This page includes data-testid attributes for automated testing.
                  Use these selectors to test modal functionality programmatically.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Manual Testing Checklist</h3>
                <ul className="text-sm space-y-1">
                  <li>✅ Modals render with correct sizes</li>
                  <li>✅ Backdrop blur and click-to-close works</li>
                  <li>✅ Escape key functionality</li>
                  <li>✅ Focus trap keeps focus within modal</li>
                  <li>✅ Smooth fade in/out animations</li>
                  <li>✅ Portal rendering prevents z-index issues</li>
                  <li>✅ Body scroll lock when modal is open</li>
                  <li>✅ Form submissions work correctly</li>
                  <li>✅ Multiple modals can be nested</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Performance Notes</h3>
                <p className="text-sm text-muted-foreground">
                  Modals use React Portals and are only rendered when needed.
                  Animation cleanup prevents memory leaks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}